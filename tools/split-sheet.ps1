# Splits a horizontal character pose sheet (white background) into separate
# transparent PNGs. Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools/split-sheet.ps1 -Sheet assets/_sheet.png -Names idle,eat,happy,sleep -Prefix pet_
param(
  [Parameter(Mandatory = $true)][string]$Sheet,
  [Parameter(Mandatory = $true)][string[]]$Names,
  [string]$Prefix = "pet_",
  [string]$OutDir = "",
  [int]$Pad = 12,
  [int]$MinGap = 6
)
Add-Type -AssemblyName System.Drawing
if ($Names.Count -eq 1 -and $Names[0] -like "*,*") { $Names = $Names[0].Split(',') }
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if ($OutDir -eq "") { $OutDir = Join-Path $root "assets" }
$sheetPath = if ([IO.Path]::IsPathRooted($Sheet)) { $Sheet } else { Join-Path $root $Sheet }

$src = [System.Drawing.Bitmap]::FromFile($sheetPath)
$w = $src.Width; $h = $src.Height
$bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp); $g.DrawImage($src, 0, 0, $w, $h); $g.Dispose(); $src.Dispose()

$rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $data.Stride
$bytes = New-Object byte[] ($stride * $h)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

# 1) make near-white transparent (soft edge), 2) count opaque pixels per column
$colCount = New-Object int[] $w
for ($y = 0; $y -lt $h; $y++) {
  $o = $y * $stride
  for ($x = 0; $x -lt $w; $x++) {
    $i = $o + $x * 4
    $b = $bytes[$i]; $gg = $bytes[$i + 1]; $r = $bytes[$i + 2]
    $mn = [Math]::Min($r, [Math]::Min($gg, $b))
    if ($mn -ge 245) { $bytes[$i + 3] = 0 }
    elseif ($mn -ge 215) { $bytes[$i + 3] = [byte](255 - (($mn - 215) * 255 / 30)); $colCount[$x]++ }
    else { $bytes[$i + 3] = 255; $colCount[$x]++ }
  }
}
[System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
$bmp.UnlockBits($data)

# find horizontal segments separated by >= MinGap empty columns (objects with s/e)
$segs = New-Object System.Collections.Generic.List[object]
$inSeg = $false; $start = 0; $gap = 0; $end = 0
for ($x = 0; $x -lt $w; $x++) {
  if ($colCount[$x] -gt 0) {
    if (-not $inSeg) { $inSeg = $true; $start = $x }
    $gap = 0; $end = $x
  } elseif ($inSeg) {
    $gap++
    if ($gap -ge $MinGap) { $segs.Add([pscustomobject]@{ s = $start; e = $end }); $inSeg = $false }
  }
}
if ($inSeg) { $segs.Add([pscustomobject]@{ s = $start; e = $end }) }
Write-Host ("raw segments: " + $segs.Count)

# merge tiny segments (e.g. floating 'zzz' text) into the nearest big one
$minW = [int]($w * 0.06)
$big = New-Object System.Collections.Generic.List[object]
foreach ($sg in $segs) { if (($sg.e - $sg.s) -ge $minW) { $big.Add([pscustomobject]@{ s = $sg.s; e = $sg.e }) } }
foreach ($sg in $segs) {
  if (($sg.e - $sg.s) -lt $minW -and $big.Count -gt 0) {
    $best = 0; $bd = [int]::MaxValue
    for ($k = 0; $k -lt $big.Count; $k++) {
      $d = [Math]::Min([Math]::Abs($big[$k].s - $sg.e), [Math]::Abs($sg.s - $big[$k].e))
      if ($d -lt $bd) { $bd = $d; $best = $k }
    }
    $big[$best].s = [Math]::Min($big[$best].s, $sg.s)
    $big[$best].e = [Math]::Max($big[$best].e, $sg.e)
  }
}
$segs = $big

# too few segments (poses touching): split the widest one at its thinnest column
$guard = 0
while ($segs.Count -lt $Names.Count -and $guard -lt 10) {
  $guard++
  $wi = 0
  for ($k = 1; $k -lt $segs.Count; $k++) { if (($segs[$k].e - $segs[$k].s) -gt ($segs[$wi].e - $segs[$wi].s)) { $wi = $k } }
  $s0 = [int]$segs[$wi].s; $s1 = [int]$segs[$wi].e
  $lo = $s0 + [int](($s1 - $s0) * 0.3); $hi = $s0 + [int](($s1 - $s0) * 0.7)
  $cut = $lo; $cmin = [int]::MaxValue
  for ($x = $lo; $x -le $hi; $x++) { if ($colCount[$x] -lt $cmin) { $cmin = $colCount[$x]; $cut = $x } }
  Write-Host ("splitting segment " + $s0 + "-" + $s1 + " at x=" + $cut + " (thinnest column, " + $cmin + " px)")
  $segs.RemoveAt($wi)
  $segs.Add([pscustomobject]@{ s = $s0; e = $cut })
  $segs.Add([pscustomobject]@{ s = ($cut + 1); e = $s1 })
}
$segs = @($segs | Sort-Object s)
if ($segs.Count -ne $Names.Count) { Write-Host ("WARNING: expected " + $Names.Count + " poses but found " + $segs.Count) }

$n = [Math]::Min($segs.Count, $Names.Count)
for ($k = 0; $k -lt $n; $k++) {
  $x0 = [int]$segs[$k].s; $x1 = [int]$segs[$k].e
  # row bounds inside this column range
  $y0 = -1; $y1 = -1
  for ($y = 0; $y -lt $h; $y++) {
    $any = $false
    for ($x = $x0; $x -le $x1; $x++) { if ($bmp.GetPixel($x, $y).A -gt 0) { $any = $true; break } }
    if ($any) { if ($y0 -lt 0) { $y0 = $y }; $y1 = $y }
  }
  $cx = [Math]::Max(0, $x0 - $Pad); $cy = [Math]::Max(0, $y0 - $Pad)
  $cw = [Math]::Min($w - $cx, $x1 - $x0 + 1 + 2 * $Pad); $ch = [Math]::Min($h - $cy, $y1 - $y0 + 1 + 2 * $Pad)
  # square canvas, character bottom-aligned, horizontally centered
  $side = [Math]::Max($cw, $ch)
  $out = New-Object System.Drawing.Bitmap $side, $side, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $og = [System.Drawing.Graphics]::FromImage($out)
  $og.Clear([System.Drawing.Color]::Transparent)
  $dx = [int](($side - $cw) / 2); $dy = $side - $ch
  $og.DrawImage($bmp, (New-Object System.Drawing.Rectangle $dx, $dy, $cw, $ch), (New-Object System.Drawing.Rectangle $cx, $cy, $cw, $ch), [System.Drawing.GraphicsUnit]::Pixel)
  $og.Dispose()
  $path = Join-Path $OutDir ($Prefix + $Names[$k] + ".png")
  $out.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $out.Dispose()
  Write-Host ("wrote " + $path + "  (" + $side + "x" + $side + ", src x " + $x0 + "-" + $x1 + ", y " + $y0 + "-" + $y1 + ")")
}
$bmp.Dispose()
