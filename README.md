# Video Downloader Pro Backend

Un backend complet pentru descărcarea de videoclipuri de pe multiple platforme cu sistem hibrid de fallback.

## 🚀 Funcționalități

### ✅ Platforme Suportate
- **YouTube** - Videoclipuri individuale și playlist-uri
- **PornHub** - Descărcare directă cu calități multiple
- **TikTok** - Fără watermark
- **Instagram** - Postări și stories
- **Twitter/X** - Videoclipuri și GIF-uri
- **Vimeo** - Videoclipuri de înaltă calitate

### 🔧 Sistem Hibrid
- **Analiză**: YouTube Data API v3 → ytdl-core → yt-dlp
- **Descărcare**: ytdl-core → yt-dlp (fallback)
- **Debugging**: Informații detaliate în frontend și backend

## 📦 Dependințe

- Node.js >= 18.0.0
- yt-dlp (descărcat automat)
- fluent-ffmpeg pentru procesare video

## 🚀 Deployment pe Render.com

### 1. Configurare Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/video-downloader-pro-backend.git
git push -u origin main
```

### 2. Render.com Setup
1. Creează un nou **Web Service**
2. Conectează repository-ul GitHub
3. Folosește configurația din `render.yaml`
4. Setează variabilele de mediu:
   - `NODE_ENV`: production
   - `PORT`: 10000
   - `YT_DLP_PATH`: ./yt-dlp

### 3. Build Command
```bash
npm install
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp
chmod +x yt-dlp
```

### 4. Start Command
```bash
node server.js
```

## 🔑 YouTube Data API v3

Pentru funcționalitatea completă YouTube, setează:
```bash
export YOUTUBE_API_KEY="your_api_key_here"
```

## 📁 Structura Fișierelor

```
├── server.js              # Backend principal
├── package.json           # Dependințe și scripturi
├── render.yaml            # Configurare Render.com
├── README.md              # Documentație
└── .gitignore            # Fișiere excluse din Git
```

## 🛠️ Dezvoltare Locală

```bash
npm install
npm start
```

Serverul va rula pe `http://localhost:3000`

## 🔍 Debugging

- **Frontend**: Console F12 cu informații despre metoda de descărcare
- **Backend**: Logs detaliate pentru fiecare pas al procesului
- **Calități**: Detectare dinamică pentru YouTube, calități statice pentru alte platforme

## 📊 Performanță

- **YouTube**: Analiză rapidă prin API v3, descărcare prin ytdl-core
- **Alte platforme**: Descărcare directă cu librării specializate
- **Fallback**: Sistem robust cu multiple metode de rezervă

## 🚨 Limitări

- Render.com free plan: 750 ore/lună
- yt-dlp descărcat automat în timpul build-ului
- Dependințe actualizate la ultimele versiuni stabile

## 📞 Suport

Pentru probleme sau întrebări, verifică:
1. Logs Render.com
2. Console browser (F12)
3. Terminal local pentru debugging
