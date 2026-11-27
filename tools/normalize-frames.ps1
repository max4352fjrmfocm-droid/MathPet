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
$bmps = @()
foreach ($f in $Files) { $bmps += [System.Drawing.Bitmap]::FromFile((Resolve-Path $f).Path) }
[int]$size = 0
foreach ($b in $bmps) { if ($b.Width -gt $size) { $size = $b.Width }; if ($b.Height -gt $size) { $size = $b.Height } }
for ($i = 0; $i -lt $bmps.Count; $i++) {
  $src = $bmps[$i]
  $canvas = New-Object System.Drawing.Bitmap ([int]$size), ([int]$size)
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.DrawImage($src, [int](($size - $src.Width) / 2), [int]($size - $src.Height), [int]$src.Width, [int]$src.Height)
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
