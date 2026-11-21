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

  $petPath = Join-Path $root "assets\pet_idle.png"
  if (Test-Path $petPath) {
    # character sprite, centered, leaving room for the math marks below
    $pet = [System.Drawing.Bitmap]::FromFile($petPath)
    $ph = $size * 0.66; $pw = $ph * $pet.Width / $pet.Height
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($pet, [float](($size - $pw) / 2), [float]($size * 0.10), [float]$pw, [float]$ph)
    $pet.Dispose()
  } else {
    # fallback egg: white ellipse, slightly narrower than tall
    $eggW = $size * 0.42; $eggH = $size * 0.54
    $ex = ($size - $eggW) / 2; $ey = $size * 0.16
    $shadow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(60, 120, 80, 0))
    $g.FillEllipse($shadow, $ex + $size * 0.02, $ey + $size * 0.03, $eggW, $eggH)
    $egg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 250, 235))
    $g.FillEllipse($egg, $ex, $ey, $eggW, $eggH)
  }

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
