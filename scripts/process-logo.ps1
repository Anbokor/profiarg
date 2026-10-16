$srcPath = "C:\Users\Ankalin\.gemini\antigravity\brain\351b0d33-9f56-4bb8-819b-7feb520327e2\.user_uploaded\media_1792172019292_c40a684e.png"
$publicDir = "C:\Users\Ankalin\.gemini\antigravity\scratch\profiarg\public"
$appDir = "C:\Users\Ankalin\.gemini\antigravity\scratch\profiarg\app"

if (!(Test-Path $publicDir)) {
    New-Item -ItemType Directory -Path $publicDir -Force | Out-Null
}

Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Output ("Source size: " + $src.Width + "x" + $src.Height)

# Copy source to public/logo.png
Copy-Item $srcPath (Join-Path $publicDir "logo.png") -Force

# 1. Full horizontal logo trimmed tightly: minX: 43, minY: 51, w: 583, h: 272
$cropRect = New-Object System.Drawing.Rectangle(43, 51, 583, 272)
$croppedFull = New-Object System.Drawing.Bitmap(583, 272, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g1 = [System.Drawing.Graphics]::FromImage($croppedFull)
$g1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g1.DrawImage($src, (New-Object System.Drawing.Rectangle(0, 0, 583, 272)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$g1.Dispose()
$croppedFull.Save((Join-Path $publicDir "logo-horizontal.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$croppedFull.Dispose()

# 2. Emblem only: x: 43 to 276 (w: 234), y: 51 to 322 (h: 272)
$iconBitmap = New-Object System.Drawing.Bitmap(272, 272, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g2 = [System.Drawing.Graphics]::FromImage($iconBitmap)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$emblemRect = New-Object System.Drawing.Rectangle(43, 51, 234, 272)
$destRect = New-Object System.Drawing.Rectangle(19, 0, 234, 272)
$g2.DrawImage($src, $destRect, $emblemRect, [System.Drawing.GraphicsUnit]::Pixel)
$g2.Dispose()
$iconBitmap.Save((Join-Path $publicDir "logo-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)

# 3. Also save favicon / app icon in app/icon.png (and public/icon.png)
$iconBitmap.Save((Join-Path $appDir "icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$iconBitmap.Save((Join-Path $publicDir "icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$iconBitmap.Dispose()

$src.Dispose()
Write-Output "Successfully generated logo.png, logo-horizontal.png, logo-icon.png, and app/icon.png"
