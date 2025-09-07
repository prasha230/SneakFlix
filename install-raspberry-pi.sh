#!/bin/bash

# SneakFlix Raspberry Pi Installation Script
echo "🎬 Installing SneakFlix on Raspberry Pi"
echo "======================================="

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource repository for latest LTS)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install build essentials for native modules
echo "📦 Installing build tools..."
sudo apt-get install -y build-essential python3-dev

# Install optional dependencies for enhanced features
echo "📦 Installing optional dependencies..."
# FFmpeg for thumbnail generation (optional)
sudo apt-get install -y ffmpeg

# Create media directory
echo "📁 Setting up media directory..."
sudo mkdir -p /media/usb
sudo chown pi:pi /media/usb

# Install SneakFlix dependencies
echo "📦 Installing SneakFlix dependencies..."
npm install

# Create systemd service for auto-start
echo "⚙️  Setting up systemd service..."
sudo tee /etc/systemd/system/sneakflix.service > /dev/null <<EOF
[Unit]
Description=SneakFlix Media Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
Environment=MEDIA_PATH=/media/usb
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable sneakflix
sudo systemctl start sneakflix

# Show status
echo "🎉 Installation completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Copy your movie files to /media/usb/"
echo "2. Access SneakFlix at http://$(hostname -I | awk '{print $1}'):3000"
echo "3. Click 'Scan Media' to add your movies to the library"
echo ""
echo "🔧 Useful Commands:"
echo "- Check status: sudo systemctl status sneakflix"
echo "- View logs: sudo journalctl -u sneakflix -f"
echo "- Restart service: sudo systemctl restart sneakflix"
echo "- Stop service: sudo systemctl stop sneakflix"
echo ""
echo "🌐 Your Raspberry Pi IP address: $(hostname -I | awk '{print $1}')"
echo "🎬 SneakFlix will be available at: http://$(hostname -I | awk '{print $1}'):3000"
