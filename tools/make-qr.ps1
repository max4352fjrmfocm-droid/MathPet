# Renders tools/install-qr.png (printable install QR) from a QR module matrix.
# The matrix below encodes https://max4352fjrmfocm-droid.github.io/MathPet/
# (generated with qrcodejs, error correction M). If the URL changes, regenerate
# the matrix with tools/qr.html (see README) or just use that page directly.
Add-Type -AssemblyName System.Drawing

$url = "https://max4352fjrmfocm-droid.github.io/MathPet/"
$rows = "111111100110011111110001101111111|100000100111011110101111101000001|101110100101010000111010101011101|101110100110011111101011101011101|101110100101001000111000001011101|100000101001100111010110001000001|111111101010101010101010101111111|000000000001100111100101000000000|100101101101111010000110010100000|110001001100010011001110011100011|011110111111011010111010100110101|010000001000010100100110100011011|001000101010101110101100101001011|010111010000101100101100101011111|011101100001000111010111111111110|001101001001010011101101101110010|101101110101111101101110001011010|101100010010100011000101010101000|011111110010111001000000110000111|111111011011010000001111011100010|000100111110010101011110010000001|010110010101100100010100110000011|111011111000010010010110000011101|011100010000110100111100001011011|100000110110001011001100111110001|000000001011101001011010100011001|111111100011101011100100101011110|100000101100110001100110100010001|101110100010010000111000111111001|101110101000010110110001001010000|101110100110011110011110100010001|100000100101010001011111111001000|111111101110011100011100110011010".Split('|')

$n = $rows.Count
$cell = 14          # pixels per module
$quiet = 4          # quiet zone in modules
$qrPx = ($n + 2 * $quiet) * $cell
$w = $qrPx
$h = $qrPx + 150    # room for caption

$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$black = [System.Drawing.Brushes]::Black

for ($r = 0; $r -lt $n; $r++) {
  $line = $rows[$r]
  for ($c = 0; $c -lt $n; $c++) {
    if ($line[$c] -eq '1') {
      $g.FillRectangle($black, ($quiet + $c) * $cell, ($quiet + $r) * $cell, $cell, $cell)
    }
  }
}

$fmt = New-Object System.Drawing.StringFormat
$fmt.Alignment = [System.Drawing.StringAlignment]::Center
$titleFont = New-Object System.Drawing.Font "Arial", 30, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$urlFont = New-Object System.Drawing.Font "Arial", 18, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$gray = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 90, 90, 90))
$g.DrawString("MathPet - scan to install", $titleFont, $black, (New-Object System.Drawing.RectangleF 0, ($qrPx + 20), $w, 44), $fmt)
$g.DrawString($url, $urlFont, $gray, (New-Object System.Drawing.RectangleF 0, ($qrPx + 72), $w, 30), $fmt)
$g.Dispose()

$out = Join-Path $PSScriptRoot "install-qr.png"
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "wrote $out"
