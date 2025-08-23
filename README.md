# 🎥 Video Downloader Pro Backend

Un backend robust pentru descărcarea de videoclipuri de pe multiple platforme (YouTube, TikTok, Instagram, etc.) cu sistem hibrid de fallback.

## 🚀 Deployment pe Render.com

### Pași de deployment:

1. **Fork/Clone repository-ul**
2. **Pe Render.com:**
   - New → Web Service
   - Connect repository
   - Configure:
     - **Name:** `video-downloader-pro`
     - **Environment:** `Node`
     - **Build Command:** `npm install && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp && chmod +x yt-dlp`
     - **Start Command:** `node server.js`
     - **Plan:** `Starter` (gratuit)

### Environment Variables pe Render:
```
NODE_ENV=production
PORT=10000
YT_DLP_PATH=./yt-dlp
```

## 🔧 Funcționalități

- ✅ **YouTube:** Analiză API v3 + ytdl-core + yt-dlp fallback
- ✅ **Playlist-uri:** Descărcare completă cu arhivare ZIP
- ✅ **Multiple platforme:** TikTok, Instagram, Twitter, Vimeo, PornHub
- ✅ **Sistem hibrid:** ytdl-core (primar) → yt-dlp (fallback)
- ✅ **Debug complet:** Informații despre librăria folosită

## 📦 Dependințe

- Node.js >= 18.0.0
- yt-dlp (instalat automat pe Render)
- Librării Node.js (instalate automat)

## 🌐 URL-uri suportate

- **YouTube:** `https://www.youtube.com/watch?v=...`
- **Playlist:** `https://www.youtube.com/playlist?list=...`
- **TikTok:** `https://www.tiktok.com/@.../video/...`
- **Instagram:** `https://www.instagram.com/p/...`
- **Twitter:** `https://twitter.com/.../status/...`
- **Vimeo:** `https://vimeo.com/...`
- **PornHub:** `https://www.pornhub.com/view_video.php?viewkey=...`

## 🎯 Calități suportate

- **Video:** 4K, 2K, 1080p, 720p, 480p, 360p, 240p
- **Audio:** MP3 (highest quality)
- **Format:** MP4, MP3

## 🔍 Debug

Aplicația afișează informații complete despre:
- Metoda de analiză folosită
- Librăria de download (ytdl-core vs yt-dlp)
- Calitățile reale disponibile
- Progresul download-ului

## 📱 Frontend

Interfața web este inclusă în același repository și se servește automat de pe Render.com.
