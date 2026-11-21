# Cleans a transparent sprite PNG: erases given rectangles (slivers of neighbouring
# poses left by the sheet split) and then keeps only the largest connected blob.
# Usage: clean-sprite.ps1 -File assets/pet_idle.png -Erase "330,0,30,200;0,0,10,10"
#   Erase rects are "x,y,w,h" separated by ';' (may be empty).
param(
  [Parameter(Mandatory = $true)][string]$File,
  [string]$Erase = "",
  [switch]$KeepAll
)
Add-Type -AssemblyName System.Drawing
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$path = if ([IO.Path]::IsPathRooted($File)) { $File } else { Join-Path $root $File }

$src = [System.Drawing.Bitmap]::FromFile($path)
$w = $src.Width; $h = $src.Height
$bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp); $g.DrawImage($src, 0, 0, $w, $h); $g.Dispose(); $src.Dispose()

$rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $data.Stride
$bytes = New-Object byte[] ($stride * $h)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

# 1) erase rectangles
if ($Erase -ne "") {
  foreach ($r in $Erase.Split(';')) {
    if ($r.Trim() -eq "") { continue }
    $p = $r.Split(',') | ForEach-Object { [int]$_ }
    for ($y = [Math]::Max(0, $p[1]); $y -lt [Math]::Min($h, $p[1] + $p[3]); $y++) {
      for ($x = [Math]::Max(0, $p[0]); $x -lt [Math]::Min($w, $p[0] + $p[2]); $x++) {
        $bytes[$y * $stride + $x * 4 + 3] = 0
      }
    }
  }
}

# 2) keep only the largest connected opaque blob (4-neighbour, alpha > 40)
if (-not $KeepAll) {
  $label = New-Object int[] ($w * $h)
  $sizes = New-Object System.Collections.Generic.List[int]
  $sizes.Add(0)
  $cur = 0
  $stack = New-Object System.Collections.Generic.Stack[int]
  for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
      $idx = $y * $w + $x
      if ($label[$idx] -ne 0) { continue }
      if ($bytes[$y * $stride + $x * 4 + 3] -le 40) { continue }
      $cur++; $sizes.Add(0)
      $stack.Push($idx)
      $label[$idx] = $cur
      while ($stack.Count -gt 0) {
        $i = $stack.Pop(); $sizes[$cur]++
        $px = $i % $w; $py = [int][Math]::Floor($i / $w)
        foreach ($d in @(@(1,0), @(-1,0), @(0,1), @(0,-1))) {
          $nx = $px + $d[0]; $ny = $py + $d[1]
          if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $w -or $ny -ge $h) { continue }
          $ni = $ny * $w + $nx
          if ($label[$ni] -ne 0) { continue }
          if ($bytes[$ny * $stride + $nx * 4 + 3] -le 40) { continue }
          $label[$ni] = $cur
          $stack.Push($ni)
        }
      }
    }
  }
  $best = 1
  for ($k = 2; $k -le $cur; $k++) { if ($sizes[$k] -gt $sizes[$best]) { $best = $k } }
  # also keep blobs that are at least 30% of the biggest (e.g. 'zzz' text) and not touching the border
  $keep = New-Object bool[] ($cur + 1)
  for ($k = 1; $k -le $cur; $k++) { if ($sizes[$k] -ge $sizes[$best] * 0.3 -or $k -eq $best) { $keep[$k] = $true } }
  for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
      $l = $label[$y * $w + $x]
      $a = $bytes[$y * $stride + $x * 4 + 3]
      if ($a -gt 0 -and ($l -eq 0 -or -not $keep[$l])) {
        # faint edge pixels adjacent to a kept blob survive; others go
        $near = $false
        if ($a -le 40) {
          foreach ($d in @(@(1,0), @(-1,0), @(0,1), @(0,-1))) {
            $nx = $x + $d[0]; $ny = $y + $d[1]
            if ($nx -ge 0 -and $ny -ge 0 -and $nx -lt $w -and $ny -lt $h) { $nl = $label[$ny * $w + $nx]; if ($nl -ne 0 -and $keep[$nl]) { $near = $true; break } }
          }
        }
        if (-not $near) { $bytes[$y * $stride + $x * 4 + 3] = 0 }
      }
    }
  }
  Write-Host ("blobs: " + $cur + ", kept largest=" + $sizes[$best] + " px")
}

[System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
$bmp.UnlockBits($data)
$tmp = $path + ".tmp.png"
$bmp.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Move-Item -Force $tmp $path
Write-Host "cleaned $path"
