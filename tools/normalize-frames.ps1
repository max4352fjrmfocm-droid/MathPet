# 같은 동작의 프레임들을 같은 크기 정사각형(아래 중앙 정렬)으로 맞춘 뒤 -Max px로 줄여 저장.
# 프레임마다 잘린 크기가 다르면 화면에서 캐릭터 크기가 들쭉날쭉해지므로 이 단계가 필요함.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File tools/normalize-frames.ps1 -Files a.png,b.png -OutDir assets -Max 512
param(
  [Parameter(Mandatory = $true)][string[]]$Files,
  [string]$OutDir = "assets",
  [int]$Max = 512
)
if ($Files.Count -eq 1 -and $Files[0] -like "*,*") { $Files = $Files[0].Split(',') }
Add-Type -AssemblyName System.Drawing
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
# 투명하지 않은 픽셀의 경계 상자 (잘라낸 뒤 남은 여백을 없애 프레임마다 캐릭터 위치가 흔들리지 않게)
function Get-AlphaBox($bmp) {
  $rect = New-Object System.Drawing.Rectangle 0, 0, $bmp.Width, $bmp.Height
  $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $bytes = New-Object byte[] ($data.Stride * $bmp.Height)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
  $bmp.UnlockBits($data)
  $minX = $bmp.Width; $minY = $bmp.Height; $maxX = -1; $maxY = -1
  for ($y = 0; $y -lt $bmp.Height; $y++) {
    $row = $y * $data.Stride
    for ($x = 0; $x -lt $bmp.Width; $x++) {
      if ($bytes[$row + $x * 4 + 3] -gt 8) {
        if ($x -lt $minX) { $minX = $x }; if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }; if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  if ($maxX -lt 0) { return $rect }
  return New-Object System.Drawing.Rectangle $minX, $minY, ($maxX - $minX + 1), ($maxY - $minY + 1)
}
$bmps = @(); $boxes = @()
foreach ($f in $Files) { $b = [System.Drawing.Bitmap]::FromFile((Resolve-Path $f).Path); $bmps += $b; $boxes += (Get-AlphaBox $b) }
[int]$size = 0
foreach ($bx in $boxes) { if ($bx.Width -gt $size) { $size = $bx.Width }; if ($bx.Height -gt $size) { $size = $bx.Height } }
$size = [int]($size * 1.04)   # 살짝 여백
for ($i = 0; $i -lt $bmps.Count; $i++) {
  $src = $bmps[$i]; $bx = $boxes[$i]
  $canvas = New-Object System.Drawing.Bitmap ([int]$size), ([int]$size)
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.Clear([System.Drawing.Color]::Transparent)
  $dest = New-Object System.Drawing.Rectangle ([int](($size - $bx.Width) / 2)), ([int]($size - $bx.Height - 2)), ([int]$bx.Width), ([int]$bx.Height)
  $g.DrawImage($src, $dest, $bx, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $out = New-Object System.Drawing.Bitmap ([int]$Max), ([int]$Max)
  $g2 = [System.Drawing.Graphics]::FromImage($out)
  $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g2.Clear([System.Drawing.Color]::Transparent)
  $g2.DrawImage($canvas, 0, 0, [int]$Max, [int]$Max)
  $g2.Dispose()
  $name = [System.IO.Path]::GetFileName($Files[$i])
  $dest = Join-Path (Join-Path $root $OutDir) $name
  $out.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
  $out.Dispose(); $canvas.Dispose(); $src.Dispose()
  Write-Host "wrote $dest (canvas $size -> $Max)"
}
