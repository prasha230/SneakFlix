# SneakFlix Raspberry Pi Deployment Script (Windows)
param(
    [Parameter(Mandatory=$true)]
    [string]$PiIP,
    
    [Parameter(Mandatory=$false)]
    [string]$PiUser = "pi",
    
    [Parameter(Mandatory=$false)]
    [string]$PiPassword = "",
    
    [Parameter(Mandatory=$false)]
    [string]$DeployPath = "/home/pi/sneakflix"
)

Write-Host "🎬 Deploying SneakFlix to Raspberry Pi" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Target: $PiUser@$PiIP" -ForegroundColor Yellow
Write-Host "Deploy Path: $DeployPath" -ForegroundColor Yellow
Write-Host ""

# Check if SCP is available (comes with Git for Windows or Windows OpenSSH)
try {
    scp 2>&1 | Out-Null
} catch {
    Write-Host "❌ SCP not found. Please install Git for Windows or Windows OpenSSH" -ForegroundColor Red
    Write-Host "   Git for Windows: https://git-scm.windows.com/" -ForegroundColor Yellow
    Write-Host "   Or enable Windows OpenSSH feature" -ForegroundColor Yellow
    exit 1
}

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow

# Create temporary deployment directory
$tempDir = "temp-deploy"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy necessary files (exclude node_modules, media, database)
$filesToCopy = @(
    "server.js",
    "database.js", 
    "mediaScanner.js",
    "package.json",
    "config.example.js",
    "install-raspberry-pi.sh",
    "README.md",
    ".gitignore"
)

$dirsToopy = @(
    "scripts",
    "public"
)

Write-Host "📁 Copying application files..." -ForegroundColor Yellow
foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item $file "$tempDir\$file"
        Write-Host "  ✅ $file" -ForegroundColor Green
    }
}

foreach ($dir in $dirsToopy) {
    if (Test-Path $dir) {
        Copy-Item -Recurse $dir "$tempDir\$dir"
        Write-Host "  ✅ $dir\" -ForegroundColor Green
    }
}

# Create Pi-specific configuration
$piConfig = @"
// SneakFlix Raspberry Pi Configuration
module.exports = {
    // Server Settings
    port: process.env.PORT || 3000,
    host: '0.0.0.0', // Listen on all interfaces for network access
    
    // Media Directory - Raspberry Pi paths
    mediaPath: process.env.MEDIA_PATH || '/media/usb',
    
    // Database Settings
    dbPath: process.env.DB_PATH || './sneakflix.db',
    
    // Supported video formats
    supportedFormats: ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'],
    
    // Raspberry Pi optimizations
    raspberry: {
        // Lower memory usage
        maxConcurrentStreams: 2,
        // Smaller buffer for Pi
        streamBufferSize: 512 * 1024, // 512KB
        // Enable hardware acceleration if available
        hardwareAcceleration: true
    },
    
    // Performance settings optimized for Pi
    streamBufferSize: 512 * 1024, // 512KB buffer for Pi
    
    // CORS settings
    cors: {
        origin: '*', // Allow all origins for local network access
        credentials: true
    }
};
"@

Set-Content -Path "$tempDir\config.js" -Value $piConfig
Write-Host "  ✅ config.js (Pi-optimized)" -ForegroundColor Green

# Create Pi environment file
$piEnv = @"
# SneakFlix Production Environment (Raspberry Pi)
PORT=3000
NODE_ENV=production
MEDIA_PATH=/media/usb
DB_PATH=./sneakflix.db
DEBUG=false
"@

Set-Content -Path "$tempDir\.env" -Value $piEnv
Write-Host "  ✅ .env (Pi configuration)" -ForegroundColor Green

# Create deployment archive
Write-Host "📦 Creating deployment archive..." -ForegroundColor Yellow
$archiveName = "sneakflix-deploy.zip"
if (Test-Path $archiveName) {
    Remove-Item $archiveName
}

# Use PowerShell's Compress-Archive
Compress-Archive -Path "$tempDir\*" -DestinationPath $archiveName
Write-Host "✅ Created $archiveName" -ForegroundColor Green

# Clean up temp directory
Remove-Item -Recurse -Force $tempDir

Write-Host ""
Write-Host "🚀 Deploying to Raspberry Pi..." -ForegroundColor Yellow

# Transfer files to Pi
Write-Host "📤 Uploading files to $PiIP..." -ForegroundColor Yellow
try {
    # Copy the archive to Pi
    scp $archiveName "$PiUser@$PiIP`:~/"
    if ($LASTEXITCODE -ne 0) {
        throw "SCP failed"
    }
    Write-Host "✅ Files uploaded successfully" -ForegroundColor Green
    
    # SSH commands to set up on Pi
    $sshCommands = @"
cd ~
unzip -o sneakflix-deploy.zip -d sneakflix
cd sneakflix
chmod +x install-raspberry-pi.sh
echo "Files deployed successfully to ~/sneakflix/"
echo "Run the following commands on your Pi to complete setup:"
echo "  cd ~/sneakflix"
echo "  sudo ./install-raspberry-pi.sh"
"@
    
    Write-Host "🔧 Setting up on Raspberry Pi..." -ForegroundColor Yellow
    echo $sshCommands | ssh "$PiUser@$PiIP" 'bash'
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Deployment completed but setup may need manual completion" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. Raspberry Pi is powered on and connected to network" -ForegroundColor White
    Write-Host "  2. SSH is enabled on the Pi" -ForegroundColor White
    Write-Host "  3. IP address is correct: $PiIP" -ForegroundColor White
    Write-Host "  4. You can SSH to the Pi manually: ssh $PiUser@$PiIP" -ForegroundColor White
    exit 1
}

# Clean up deployment archive
Remove-Item $archiveName

Write-Host ""
Write-Host "🎉 Deployment Summary:" -ForegroundColor Green
Write-Host "✅ Files transferred to Raspberry Pi" -ForegroundColor Green
Write-Host "✅ Pi-optimized configuration applied" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps on Raspberry Pi:" -ForegroundColor Cyan
Write-Host "1. SSH to your Pi: ssh $PiUser@$PiIP" -ForegroundColor White
Write-Host "2. Navigate to: cd ~/sneakflix" -ForegroundColor White
Write-Host "3. Run setup: sudo ./install-raspberry-pi.sh" -ForegroundColor White
Write-Host "4. Copy your movies to /media/usb/" -ForegroundColor White
Write-Host "5. Access SneakFlix at: http://$PiIP`:3000" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Useful Pi Commands:" -ForegroundColor Cyan
Write-Host "- Check status: sudo systemctl status sneakflix" -ForegroundColor White
Write-Host "- View logs: sudo journalctl -u sneakflix -f" -ForegroundColor White
Write-Host "- Restart: sudo systemctl restart sneakflix" -ForegroundColor White
