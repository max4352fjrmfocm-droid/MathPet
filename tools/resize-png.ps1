# Downscales PNGs in place so the largest side is at most -Max pixels (keeps alpha).
# Usage: resize-png.ps1 -Files assets/pet_baby.png,assets/pet_child.png -Max 512
param(
  [Parameter(Mandatory = $true)][string[]]$Files,
  [int]$Max = 512
)
Add-Type -AssemblyName System.Drawing
if ($Files.Count -eq 1 -and $Files[0] -like "*,*") { $Files = $Files[0].Split(',') }
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
foreach ($f in $Files) {
  $path = if ([IO.Path]::IsPathRooted($f)) { $f } else { Join-Path $root $f }
  $src = [System.Drawing.Bitmap]::FromFile($path)
  $w = $src.Width; $h = $src.Height
  $scale = [Math]::Min(1.0, $Max / [Math]::Max($w, $h))
  if ($scale -ge 1.0) { $src.Dispose(); Write-Host "skip $path ($w x $h)"; continue }
  $nw = [int][Math]::Round($w * $scale); $nh = [int][Math]::Round($h * $scale)
  $dst = New-Object System.Drawing.Bitmap $nw, $nh, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($dst)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.DrawImage($src, 0, 0, $nw, $nh)
  $g.Dispose(); $src.Dispose()
  $tmp = $path + ".tmp.png"
  $dst.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
  $dst.Dispose()
  Move-Item -Force $tmp $path
  Write-Host ("resized " + $path + " -> " + $nw + "x" + $nh + " (" + (Get-Item $path).Length + " bytes)")
}
