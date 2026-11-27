# Fade the alpha of a square sprite toward its edges with an elliptical mask.
# Used for frames that carry a soft glow/halo: neighbouring halos overlap on the sheet, so the
# cut leaves straight edges; fading the outer ring hides them without touching the character.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File tools/fade-edges.ps1 -Files a.png,b.png [-Start 0.72]
param(
  [Parameter(Mandatory = $true)][string[]]$Files,
  [double]$Start = 0.72   # normalized elliptical distance where fading begins (1.0 = edge)
)
if ($Files.Count -eq 1 -and $Files[0] -like "*,*") { $Files = $Files[0].Split(',') }
Add-Type -AssemblyName System.Drawing
foreach ($f in $Files) {
  $path = (Resolve-Path $f).Path
  $src = [System.Drawing.Bitmap]::FromFile($path)
  $bmp = New-Object System.Drawing.Bitmap $src.Width, $src.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp); $g.DrawImage($src, 0, 0, $src.Width, $src.Height); $g.Dispose(); $src.Dispose()
  $w = $bmp.Width; $h = $bmp.Height
  $rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
  $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $bytes = New-Object byte[] ($data.Stride * $h)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
  $cx = $w / 2.0; $cy = $h * 0.55; $rx = $w / 2.0; $ry = $h * 0.6
  for ($y = 0; $y -lt $h; $y++) {
    $row = $y * $data.Stride
    for ($x = 0; $x -lt $w; $x++) {
      $i = $row + $x * 4
      $a = $bytes[$i + 3]
      if ($a -eq 0) { continue }
      $dx = ($x - $cx) / $rx; $dy = ($y - $cy) / $ry
      $d = [Math]::Sqrt($dx * $dx + $dy * $dy)
      if ($d -le $Start) { continue }
      $t = ($d - $Start) / (1.0 - $Start)
      if ($t -ge 1) { $k = 0.0 } else { $k = 1.0 - $t; $k = $k * $k * (3 - 2 * $k) }
      $bytes[$i + 3] = [byte][Math]::Round($a * $k)
    }
  }
  [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
  $bmp.UnlockBits($data)
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "faded $path"
}
