# Generates placeholder app icons (icons/icon-180.png, icon-192.png, icon-512.png)
# using built-in .NET System.Drawing. Replace with real artwork later.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File tools/make-icons.ps1
Add-Type -AssemblyName System.Drawing

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$outDir = Join-Path $root "icons"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

function New-Icon([int]$size, [string]$path) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear([System.Drawing.Color]::FromArgb(255, 255, 183, 3))   # #FFB703

  # soft circle behind the egg
  $cBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(90, 255, 255, 255))
  $m = $size * 0.12
  $g.FillEllipse($cBrush, $m, $m, $size - 2 * $m, $size - 2 * $m)

  # egg: white ellipse, slightly narrower than tall
  $eggW = $size * 0.42; $eggH = $size * 0.54
  $ex = ($size - $eggW) / 2; $ey = $size * 0.16
  $shadow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(60, 120, 80, 0))
  $g.FillEllipse($shadow, $ex + $size * 0.02, $ey + $size * 0.03, $eggW, $eggH)
  $egg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 250, 235))
  $g.FillEllipse($egg, $ex, $ey, $eggW, $eggH)
  # spots
  $spot = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 209, 102))
  $g.FillEllipse($spot, $ex + $eggW * 0.25, $ey + $eggH * 0.30, $eggW * 0.16, $eggW * 0.16)
  $g.FillEllipse($spot, $ex + $eggW * 0.58, $ey + $eggH * 0.48, $eggW * 0.20, $eggW * 0.20)
  $g.FillEllipse($spot, $ex + $eggW * 0.35, $ey + $eggH * 0.66, $eggW * 0.13, $eggW * 0.13)

  # "+ - x" math marks at the bottom
  $fontSize = [float]($size * 0.13)
  $font = New-Object System.Drawing.Font "Arial", $fontSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $txtBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 74, 51, 0))
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = [System.Drawing.StringAlignment]::Center
  $rect = New-Object System.Drawing.RectangleF 0, ($size * 0.76), $size, ($size * 0.2)
  $g.DrawString("+ - x", $font, $txtBrush, $rect, $fmt)

  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "wrote $path"
}

New-Icon 180 (Join-Path $outDir "icon-180.png")
New-Icon 192 (Join-Path $outDir "icon-192.png")
New-Icon 512 (Join-Path $outDir "icon-512.png")
