# 🚀 Pinchflat Quick Start Guide

## What is Pinchflat?
Pinchflat is a self-hosted YouTube media manager that automatically downloads content from channels and playlists. It's perfect for building a YouTube library for Plex, Jellyfin, or Kodi!

## 🎯 Why Pinchflat?
- ✅ **Built on yt-dlp** - The most reliable YouTube downloader
- ✅ **Web UI** - No command line needed
- ✅ **Auto-download** - Monitors channels for new content
- ✅ **Smart organization** - Perfect for media centers
- ✅ **Cookie support** - Downloads private/restricted content
- ✅ **Active development** - 3.6k+ stars on GitHub

## 🚀 Quick Setup

### 1. Prerequisites
- Docker and Docker Compose installed
- Windows 10/11 (or Linux/Mac)

### 2. Start Pinchflat
```bash
# Option A: Use the batch file (Windows)
setup-pinchflat.bat

# Option B: Use PowerShell
.\setup-pinchflat.ps1

# Option C: Manual commands
mkdir pinchflat-config pinchflat-downloads
docker-compose -f docker-compose.pinchflat.yml up -d
```

### 3. Access the Web Interface
Open your browser and go to: **http://localhost:8945**

## 📱 First Time Setup

### 1. Create Your First Download Rule
1. Click **"Create Rule"**
2. Choose a **preset** (e.g., "YouTube Channel" or "YouTube Playlist")
3. Give it a **name** (e.g., "My Favorite Channel")
4. Set the **source** (YouTube channel or playlist URL)

### 2. Configure Download Settings
- **Quality**: Choose video quality (720p, 1080p, etc.)
- **Format**: MP4, MKV, or audio-only
- **Destination**: Where to save files
- **Naming**: How to organize files

### 3. Add YouTube Sources
- **Channel URLs**: `https://www.youtube.com/c/ChannelName`
- **Playlist URLs**: `https://www.youtube.com/playlist?list=...`
- **Individual Videos**: `https://www.youtube.com/watch?v=...`

## 🔧 Advanced Features

### Cookie Authentication
To download private/restricted content:
1. Export cookies from your browser
2. Add them in Pinchflat settings
3. Enable cookie authentication

### Media Center Integration
- **Plex**: Use Plex's YouTube metadata agent
- **Jellyfin**: Built-in YouTube support
- **Kodi**: Direct folder scanning

### Automatic Downloads
- Pinchflat checks for new content every few hours
- Downloads automatically based on your rules
- Organizes files according to your naming scheme

## 📁 File Organization Example

```
pinchflat-downloads/
├── Channel Name/
│   ├── Video Title 1 (2024-01-15).mp4
│   ├── Video Title 2 (2024-01-16).mp4
│   └── Video Title 3 (2024-01-17).mp4
└── Playlist Name/
    ├── Episode 1.mp4
    ├── Episode 2.mp4
    └── Episode 3.mp4
```

## 🛠️ Useful Commands

```bash
# Start Pinchflat
docker-compose -f docker-compose.pinchflat.yml up -d

# Stop Pinchflat
docker-compose -f docker-compose.pinchflat.yml down

# View logs
docker-compose -f docker-compose.pinchflat.yml logs -f

# Restart Pinchflat
docker-compose -f docker-compose.pinchflat.yml restart

# Update Pinchflat
docker-compose -f docker-compose.pinchflat.yml pull
docker-compose -f docker-compose.pinchflat.yml up -d
```

## 🔍 Troubleshooting

### Common Issues
1. **Port 8945 already in use**: Change the port in docker-compose.pinchflat.yml
2. **Permission errors**: Ensure directories are writable
3. **Download failures**: Check YouTube cookies and yt-dlp settings

### Getting Help
- [Pinchflat GitHub](https://github.com/kieraneglin/pinchflat)
- [Pinchflat Documentation](https://github.com/kieraneglin/pinchflat/wiki)
- [Reddit Community](https://www.reddit.com/r/selfhosted/)

## 🎉 What's Next?

1. **Test with a small channel** first
2. **Set up media center integration** (Plex/Jellyfin)
3. **Configure automatic downloads**
4. **Add more channels and playlists**
5. **Enjoy ad-free, organized YouTube content!**

---

**Happy downloading! 🎬📺**
