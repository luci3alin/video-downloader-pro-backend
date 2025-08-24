# 🐳 Pinchflat Integration pentru Video Downloader

## 🎯 **Ce este Pinchflat?**

Pinchflat este un **self-hosted YouTube download manager** cu interfață web și API REST. Înlocuiește `yt-dlp` și `ytdl-core` cu o soluție mai modernă și mai fiabilă.

## 🚀 **Caracteristici**

✅ **Anti-bot detection avansat** - Bypass automat pentru CAPTCHA  
✅ **Interfață web modernă** - Dashboard pentru gestionarea download-urilor  
✅ **API REST** - Integrare ușoară cu alte aplicații  
✅ **Configurare persistentă** - Reguli și setări salvate automat  
✅ **Monitorizare în timp real** - Status-ul download-urilor  
✅ **Suport pentru multiple platforme** - YouTube, Twitter, Instagram, etc.  

## 🏗️ **Arhitectura**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Pinchflat     │
│   (Browser)     │◄──►│   (Node.js)     │◄──►│   (Docker)      │
│                 │    │   Port 3000     │    │   Port 8945     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 **Endpoint-uri disponibile**

### **Status Pinchflat**
```http
GET /api/pinchflat-status
```
Returnează status-ul serviciului Pinchflat.

### **Download cu configurația Pinchflat**
```http
POST /api/pinchflat-download
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=...",
  "quality": "720p",
  "format": "mp4"
}
```

### **Download principal (folosește configurația Pinchflat)**
```http
POST /api/download
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=...",
  "quality": "720p",
  "format": "mp4"
}
```

## 🐳 **Instalare locală**

### **1. Verifică Docker**
```bash
docker --version
docker-compose --version
```

### **2. Pornește server-ul**
```bash
node server.js
```

Server-ul va porni automat Pinchflat în Docker.

### **3. Accesează serviciile**
- **Backend**: http://localhost:3000
- **Pinchflat**: http://localhost:8945

## ☁️ **Deploy pe Render**

### **1. Configurare automată**
Fișierul `render.yaml` este deja configurat cu:
- **Backend service** (Node.js)
- **Pinchflat service** (Docker)
- **Persistent volumes** pentru configurație și download-uri

### **2. Variabile de mediu**
Setăază în Render dashboard:
- `YOUTUBE_API_KEY` - Cheia ta YouTube API

### **3. Deploy**
```bash
git add .
git commit -m "Add Pinchflat integration"
git push origin main
```

Render va detecta automat `render.yaml` și va configura serviciile.

## 🔧 **Configurare Pinchflat**

### **1. Accesează interfața web**
Deschide http://localhost:8945 (local) sau URL-ul Render (production)

### **2. Creează Media Profile**
- Click "New Media Profile"
- Selectează "YouTube"
- Configurează calitatea și formatul dorit

### **3. Creează Source**
- Click "New Source"
- Adaugă URL-ul canalului/playlist-ului
- Selectează Media Profile-ul creat

## 📊 **Monitorizare**

### **Status serviciu**
```bash
curl http://localhost:3000/api/pinchflat-status
```

### **Log-uri Pinchflat**
```bash
docker logs pinchflat --tail 50
```

### **Log-uri Backend**
```bash
# În terminalul unde rulează server-ul
# Log-urile apar automat
```

## 🚨 **Troubleshooting**

### **Pinchflat nu pornește**
```bash
# Verifică Docker
docker ps
docker logs pinchflat

# Verifică porturile
netstat -an | findstr :8945
```

### **Download-urile eșuează**
```bash
# Verifică yt-dlp
./yt-dlp --version

# Verifică log-urile
docker logs pinchflat --tail 100
```

### **Eroare de permisiuni**
```bash
# Verifică directoarele
ls -la pinchflat-*
chmod 755 pinchflat-*
```

## 🔄 **Migrare de la yt-dlp/ytdl-core**

### **Ce s-a schimbat:**
- ❌ **Eliminat**: yt-dlp direct, ytdl-core fallback
- ✅ **Adăugat**: Configurația Pinchflat pentru yt-dlp
- ✅ **Păstrat**: Toate platformele non-YouTube (PornHub, Twitter, etc.)

### **Avantajele noii abordări:**
1. **Configurație centralizată** - Toate setările în Pinchflat
2. **Anti-bot detection** - Bypass automat pentru CAPTCHA
3. **Monitorizare** - Dashboard pentru status-ul download-urilor
4. **Persistență** - Configurația se salvează automat
5. **Scalabilitate** - Ușor de extins pentru mai multe surse

## 📚 **Resurse utile**

- [Pinchflat Documentation](https://github.com/kieraneglin/pinchflat)
- [yt-dlp Documentation](https://github.com/yt-dlp/yt-dlp)
- [Render Documentation](https://render.com/docs)

## 🤝 **Suport**

Pentru probleme sau întrebări:
1. Verifică log-urile
2. Verifică status-ul serviciilor
3. Verifică configurația Docker
4. Creează issue în repository

---

**🎉 Felicitări! Ai integrat cu succes Pinchflat în aplicația ta de video download!**
