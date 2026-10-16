Add-Type -AssemblyName System.Drawing

$srcIconPath = "C:\Users\Ankalin\.gemini\antigravity\scratch\profiarg\public\logo-icon.png"
$publicDir = "C:\Users\Ankalin\.gemini\antigravity\scratch\profiarg\public"
$appDir = "C:\Users\Ankalin\.gemini\antigravity\scratch\profiarg\app"

$src = [System.Drawing.Bitmap]::FromFile($srcIconPath)

# Function to resize bitmap
function Resize-Bitmap($orig, $targetW, $targetH) {
    $bmp = New-Object System.Drawing.Bitmap($targetW, $targetH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($orig, 0, 0, $targetW, $targetH)
    $g.Dispose()
    return $bmp
}

# Function to get PNG bytes
function Get-PngBytes($bmp) {
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bytes = $ms.ToArray()
    $ms.Dispose()
    return $bytes
}

# Generate resolutions: 16, 32, 48
$bmp16 = Resize-Bitmap $src 16 16
$bmp32 = Resize-Bitmap $src 32 32
$bmp48 = Resize-Bitmap $src 48 48
$bmp180 = Resize-Bitmap $src 180 180

$png16Bytes = Get-PngBytes $bmp16
$png32Bytes = Get-PngBytes $bmp32
$png48Bytes = Get-PngBytes $bmp48
$png180Bytes = Get-PngBytes $bmp180

# Save individual PNGs
[System.IO.File]::WriteAllBytes((Join-Path $publicDir "favicon-16x16.png"), $png16Bytes)
[System.IO.File]::WriteAllBytes((Join-Path $publicDir "favicon-32x32.png"), $png32Bytes)
[System.IO.File]::WriteAllBytes((Join-Path $publicDir "apple-touch-icon.png"), $png180Bytes)

# Pack multi-resolution ICO file (16x16, 32x32, 48x48)
# ICO Header: 6 bytes
# Directory Entries: 16 bytes each
# Total header size for 3 images = 6 + 16 * 3 = 54 bytes
$images = @(
    @{ W = 16; H = 16; Bytes = $png16Bytes },
    @{ W = 32; H = 32; Bytes = $png32Bytes },
    @{ W = 48; H = 48; Bytes = $png48Bytes }
)

$icoMs = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($icoMs)

# Header
$bw.Write([uint16]0) # Reserved
$bw.Write([uint16]1) # ICO type
$bw.Write([uint16]($images.Count)) # Number of images

# Calculate offsets
$offset = 6 + (16 * $images.Count)
foreach ($img in $images) {
    $bw.Write([byte]$img.W) # Width
    $bw.Write([byte]$img.H) # Height
    $bw.Write([byte]0)       # Color count
    $bw.Write([byte]0)       # Reserved
    $bw.Write([uint16]1)     # Color planes
    $bw.Write([uint16]32)    # Bit count
    $bw.Write([uint32]$img.Bytes.Length) # Image size
    $bw.Write([uint32]$offset)           # Image offset
    $offset += $img.Bytes.Length
}

# Image Data
foreach ($img in $images) {
    $bw.Write($img.Bytes)
}

$bw.Flush()
$icoBytes = $icoMs.ToArray()
$bw.Dispose()
$icoMs.Dispose()

# Save favicon.ico to public and app
[System.IO.File]::WriteAllBytes((Join-Path $publicDir "favicon.ico"), $icoBytes)
[System.IO.File]::WriteAllBytes((Join-Path $appDir "favicon.ico"), $icoBytes)

$bmp16.Dispose()
$bmp32.Dispose()
$bmp48.Dispose()
$bmp180.Dispose()
$src.Dispose()

Write-Output "Successfully generated favicon.ico, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png"
