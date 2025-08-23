# Deployment Guide for Render.com

## Files to Upload

Upload these files to your Render.com repository:

### Core Files
- `server.js` - Main backend server
- `package.json` - Dependencies and scripts
- `render.yaml` - Render.com configuration
- `index.html` - Frontend interface
- `script.js` - Frontend JavaScript
- `style.css` - Frontend styling

### Optional Files
- `README.md` - Project documentation
- `test-ytdlp.js` - Local testing script (not needed on Render.com)

## Render.com Configuration

The `render.yaml` file is already configured to:
1. Install Node.js dependencies
2. Download yt-dlp for Linux
3. Make yt-dlp executable
4. Set environment variables

## Environment Variables

The following environment variables are automatically set:
- `NODE_ENV=production`
- `PORT=10000`
- `YT_DLP_PATH=./yt-dlp`

## Build Process

1. Render.com will run `npm install` to install dependencies
2. Download yt-dlp Linux binary from GitHub
3. Make yt-dlp executable with `chmod +x yt-dlp`
4. Start the server with `node server.js`

## Troubleshooting

### If yt-dlp fails to download:
- Check Render.com build logs
- Verify GitHub releases are accessible
- Ensure build command has proper permissions

### If server fails to start:
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check port binding (should be 10000)

## Local Development

For local Windows development:
1. Run `npm install` to install dependencies
2. Download yt-dlp manually or use the Windows version
3. Start server with `npm start`

## Supported Platforms

- YouTube (via ytdl-core + yt-dlp fallback)
- PornHub (via pornhub.js)
- TikTok (via @tobyg74/tiktok-api-dl)
- Instagram (via instagram-url-direct)
- Twitter/X (via twitter-downloader)
- Vimeo (via @vimeo/vimeo)
