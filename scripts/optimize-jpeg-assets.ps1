param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$sourcePath = Join-Path $ProjectRoot 'src\static\brand\youjierxun-yinling-banner.jpg'
$archiveDir = Join-Path $ProjectRoot 'design\source-assets'
$archivePath = Join-Path $archiveDir 'youjierxun-yinling-banner-original.jpg'
$tempPath = "$sourcePath.optimized.jpg"

if (-not (Test-Path -LiteralPath $sourcePath)) { throw "Missing source image: $sourcePath" }
New-Item -ItemType Directory -Force -Path $archiveDir | Out-Null
if (-not (Test-Path -LiteralPath $archivePath)) { Copy-Item -LiteralPath $sourcePath -Destination $archivePath }

$source = [System.Drawing.Image]::FromFile($sourcePath)
try {
  $targetWidth = [Math]::Min(1152, $source.Width)
  $targetHeight = [Math]::Round($source.Height * $targetWidth / $source.Width)
  $bitmap = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.DrawImage($source, 0, 0, $targetWidth, $targetHeight)
    } finally { $graphics.Dispose() }

    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
    $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 78L)
    $bitmap.Save($tempPath, $codec, $parameters)
    $parameters.Dispose()
  } finally { $bitmap.Dispose() }
} finally { $source.Dispose() }

$optimized = Get-Item -LiteralPath $tempPath
if ($optimized.Length -ge 200KB) {
  Remove-Item -LiteralPath $tempPath
  throw "Optimized image is still larger than 200 KB: $($optimized.Length) bytes"
}

Move-Item -Force -LiteralPath $tempPath -Destination $sourcePath
Write-Output "Optimized banner: $($optimized.Length) bytes; original archived outside src."
