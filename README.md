# 🎬 SneakFlix - Your Personal Media Server

A lightweight, self-hosted media streaming server perfect for Raspberry Pi. Stream your movies and TV shows to any device on your local network - your own personal Netflix!

![SneakFlix Demo](https://img.shields.io/badge/Platform-Raspberry%20Pi-red) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 🌐 **Web-based interface** - Access from any device with a browser
- 🎥 **Video streaming** - Supports MP4, MKV, AVI, MOV, and more
- 🔍 **Search functionality** - Find movies quickly by title or genre
- 📱 **Responsive design** - Works on phones, tablets, and desktops
- 🚀 **Lightweight** - Perfect for Raspberry Pi 4 or newer
- 🔄 **Auto-scanning** - Automatically detects new media files
- 📊 **Media library** - Organized view of your collection
- ⚡ **Range requests** - Smooth seeking and progressive loading

## 🛠️ What You'll Need

### Hardware
- **Raspberry Pi 4** (recommended) or newer
- **MicroSD card** (16GB minimum, 32GB recommended)
- **External hard drive** or USB drive for media storage
- **Network connection** (Ethernet recommended for best performance)

### Software
- Raspberry Pi OS (latest version)
- Node.js 18 or newer
- npm (comes with Node.js)

## 🚀 Quick Installation (Raspberry Pi)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/sneakflix.git
   cd sneakflix
   ```

2. **Run the installation script:**
   ```bash
   chmod +x install-raspberry-pi.sh
   sudo ./install-raspberry-pi.sh
   ```

3. **Copy your movies** to `/media/usb/` (or your configured media directory)

4. **Access SneakFlix** at `http://[YOUR_PI_IP]:3000`

5. **Click "Scan Media"** to add your movies to the library

That's it! 🎉

## 📋 Manual Installation

If you prefer to install manually or on a different system:

### 1. Install Dependencies
```bash
# Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install build tools
sudo apt-get install -y build-essential python3-dev

# Optional: Install FFmpeg for thumbnail generation
sudo apt-get install -y ffmpeg
```

### 2. Setup SneakFlix
```bash
# Clone and install
git clone https://github.com/yourusername/sneakflix.git
cd sneakflix
npm install

# Create media directory
mkdir -p ./media

# Copy your movies to the media directory
cp /path/to/your/movies/* ./media/

# Start the server
npm start
```

### 3. Access Your Server
- Open your browser and go to `http://localhost:3000`
- From other devices: `http://[YOUR_COMPUTER_IP]:3000`

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the project root:

```bash
# Server port
PORT=3000

# Media directory (absolute path)
MEDIA_PATH=/media/usb/movies

# Database file location
DB_PATH=./sneakflix.db

# Environment
NODE_ENV=production
```

### Media Directory Structure
Organize your media like this:
```
/media/usb/
├── movies/
│   ├── Action/
│   │   ├── Movie1 (2023).mp4
│   │   └── Movie2 (2022).mkv
│   ├── Comedy/
│   │   └── Funny Movie (2023).mp4
│   └── Drama/
       └── Serious Film (2023).avi
```

## 🎮 Usage

### Adding Movies
1. Copy video files to your media directory
2. Click "Scan Media" in the web interface
3. New movies will be automatically detected and added

### Streaming
1. Click on any movie poster to start streaming
2. Use the built-in video controls for playback
3. The player supports seeking, volume control, and fullscreen

### Searching
- Use the search bar to find movies by title
- Search results update as you type

## 🌐 Network Access

### Finding Your Raspberry Pi's IP Address
```bash
hostname -I
```

### Accessing from Other Devices
Once you know your Pi's IP address, you can access SneakFlix from:
- **Phones/Tablets**: `http://192.168.1.100:3000`
- **Computers**: `http://192.168.1.100:3000`
- **Smart TVs**: Use the TV's browser to navigate to the URL

## 🔧 Troubleshooting

### Common Issues

**Movies not appearing?**
- Check that video files are in supported formats (MP4, MKV, AVI, MOV, etc.)
- Click "Scan Media" to refresh the library
- Check the media directory path in your configuration

**Can't access from other devices?**
- Make sure all devices are on the same network
- Check your Pi's IP address: `hostname -I`
- Ensure port 3000 isn't blocked by firewall

**Video won't play?**
- Check that the video file isn't corrupted
- Try a different browser
- Ensure the file format is supported by your browser

**Performance issues?**
- Use Ethernet connection instead of WiFi
- Close other applications on the Pi
- Consider using lower resolution videos for older Pi models

### Logs and Monitoring
```bash
# Check service status
sudo systemctl status sneakflix

# View logs
sudo journalctl -u sneakflix -f

# Restart service
sudo systemctl restart sneakflix
```

## 🛡️ Security Considerations

- SneakFlix is designed for **local network use only**
- Don't expose your Pi directly to the internet without proper security
- Consider setting up a VPN if you need remote access
- Keep your Raspberry Pi OS updated

## 🚀 Performance Tips

### For Best Streaming Experience:
1. **Use Ethernet** instead of WiFi when possible
2. **Organize files** in subdirectories for faster scanning
3. **Use MP4 format** for maximum compatibility
4. **Ensure sufficient power** supply for your Pi and external drive

### Recommended Video Settings:
- **Resolution**: 1080p or lower for Raspberry Pi 4
- **Bitrate**: 8-10 Mbps maximum
- **Format**: H.264 MP4 for best compatibility

## 📚 API Reference

SneakFlix provides a REST API for advanced users:

- `GET /api/movies` - Get all movies
- `GET /api/movies/search?q=query` - Search movies
- `GET /api/movies/:id` - Get movie details
- `GET /api/stream/:id` - Stream video
- `POST /api/scan` - Scan media directory

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Built with Node.js and Express
- Frontend uses vanilla JavaScript for simplicity
- Designed specifically for Raspberry Pi and local networks

---

**Enjoy your personal streaming server! 🍿🎬**
