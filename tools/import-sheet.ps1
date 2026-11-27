# Import a horizontal sprite sheet (white background, N frames in a row) into game frames.
#   1) webp/jpg/png -> assets/_raw/sheet_<Name>.png
#   2) split-sheet.ps1      -> assets/_raw/frames/pet_<Name>_N.png (transparent)
#   3) clean-sprite.ps1     -> remove slivers of neighbouring frames
#   4) normalize-frames.ps1 -> same-size square, 512px -> assets/pet_<Name>_N.png
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File tools/import-sheet.ps1 -Image "C:\...\sheet.webp" -Name teen_walk [-Count 4]
param(
  [Parameter(Mandatory = $true)][string]$Image,
  [Parameter(Mandatory = $true)][string]$Name,
  [int]$Count = 4
)
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $root
$rawDir = Join-Path $root "assets\_raw"; $frameDir = Join-Path $rawDir "frames"
foreach ($d in $rawDir, $frameDir) { if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d | Out-Null } }

# 1) convert to PNG (WPF decoder reads webp/jpg/png)
Add-Type -AssemblyName PresentationCore
$sheet = Join-Path $rawDir ("sheet_" + $Name + ".png")
$fs = [System.IO.File]::OpenRead((Resolve-Path $Image).Path)
$dec = [System.Windows.Media.Imaging.BitmapDecoder]::Create($fs, [System.Windows.Media.Imaging.BitmapCreateOptions]::PreservePixelFormat, [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
$enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
$enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($dec.Frames[0]))
$out = [System.IO.File]::Create($sheet); $enc.Save($out); $out.Close(); $fs.Close()
Write-Host ("sheet: " + $sheet + " (" + $dec.Frames[0].PixelWidth + "x" + $dec.Frames[0].PixelHeight + ")")

# 2) split
$list = @()
for ($i = 1; $i -le $Count; $i++) { $list += ($Name + "_" + $i) }
$namesArg = $list -join ','
& (Join-Path $PSScriptRoot "split-sheet.ps1") -Sheet $sheet -Names $namesArg -Prefix pet_ -OutDir "assets/_raw/frames" | Select-String "segments|wrote|split"

# 3) clean
$files = @()
for ($n = 1; $n -le $Count; $n++) {
  $f = Join-Path $frameDir ("pet_" + $Name + "_" + $n + ".png")
  if (-not (Test-Path $f)) { Write-Host ("missing " + $f + " (frame count is not " + $Count + "?)"); continue }
  & (Join-Path $PSScriptRoot "clean-sprite.ps1") -File $f | Select-String "blobs"
  $files += $f
}

# 4) normalize -> assets/
& (Join-Path $PSScriptRoot "normalize-frames.ps1") -Files ($files -join ',') -OutDir assets -Max 512
