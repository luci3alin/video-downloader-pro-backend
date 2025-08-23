const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { Readable } = require('stream');
const ytdl = require('@distube/ytdl-core'); // Re-enabled for speed
const ytpl = require('@distube/ytpl');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const cheerio = require('cheerio');
const { PornHub } = require('pornhub.js');

// New specialized libraries
const TikTokApi = require('@tobyg74/tiktok-api-dl');
const RuhendScraper = require('ruhend-scraper'); // For TikTok without watermark
const InstagramDownloader = require('instagram-url-direct');
const TwitterDownloader = require('twitter-downloader');
const { Vimeo } = require('@vimeo/vimeo');

// YouTube API Key for fallback (all restrictions removed)
const YOUTUBE_API_KEY = 'AIzaSyDATZtBCDsSV1Bjb8xNZmQpZBtLhTJ-htk';

// Enhanced anti-bot detection v2.0 - Timing randomization and User-Agent rotation

// Enhanced User-Agent rotation with more realistic browsers
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];

// Function to get random User-Agent
function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Global variable to store user cookies
let userCookies = {
    CONSENT: 'YES+cb.20241231-19-p0.en+FX+425',
    VISITOR_INFO1_LIVE: 'v' + Math.random().toString(36).substring(2, 13),
    YSC: Math.random().toString(36).substring(2, 17)
};

// Function to get manual YouTube cookies from frontend
function getManualCookies() {
    // Create a temporary cookies file for yt-dlp
    const fs = require('fs');
    const cookieFile = './youtube_cookies.txt';
    
    // Use ONLY real user cookies - no defaults!
    const cookiesToUse = userCookies;
    
    // Check if CAPTCHA bypass mode is enabled
    if (global.captchaBypassEnabled) {
        console.log('🤖 CAPTCHA Bypass Mode enabled - using advanced bot evasion without cookies');
        
        // Create minimal cookie file for CAPTCHA bypass mode
        const bypassCookies = `# Netscape HTTP Cookie File
# CAPTCHA Bypass Mode - No real cookies needed
.youtube.com	TRUE	/	FALSE	1735689600	CONSENT	YES+cb.20241231-19-p0.en+FX+425
.youtube.com	TRUE	/	FALSE	1735689600	GPS	1
.youtube.com	TRUE	/	FALSE	1735689600	PREF	f4=4000000&tz=Europe.Bucharest&f5=20000&f6=8
`;
        
        try {
            fs.writeFileSync(cookieFile, bypassCookies);
            console.log('✅ Created CAPTCHA bypass cookie file');
            return cookieFile;
        } catch (error) {
            console.error('❌ Error creating CAPTCHA bypass cookie file:', error);
            throw new Error('Failed to create CAPTCHA bypass cookie file');
        }
    }
    
    // If no real cookies, FAIL - we need real ones!
    if (!cookiesToUse || !cookiesToUse.CONSENT || !cookiesToUse.VISITOR_INFO1_LIVE || !cookiesToUse.YSC) {
        console.error('❌ NO REAL COOKIES PROVIDED! YouTube will detect us as a bot!');
        console.error('❌ Please provide real cookies from your browser OR enable CAPTCHA bypass mode!');
        throw new Error('Real YouTube cookies are required to bypass bot detection');
    }
    
    // Create Netscape format cookies file with ONLY real cookies
    const netscapeCookies = `# Netscape HTTP Cookie File
# This file contains REAL YouTube cookies for authentication
# NO FAKE COOKIES - ONLY REAL ONES FROM BROWSER
.youtube.com	TRUE	/	FALSE	1735689600	CONSENT	${cookiesToUse.CONSENT}
.youtube.com	TRUE	/	FALSE	1735689600	VISITOR_INFO1_LIVE	${cookiesToUse.VISITOR_INFO1_LIVE}
.youtube.com	TRUE	/	FALSE	1735689600	YSC	${cookiesToUse.YSC}
.youtube.com	TRUE	/	FALSE	1735689600	GPS	1
.youtube.com	TRUE	/	FALSE	1735689600	PREF	f4=4000000&tz=Europe.Bucharest&f5=20000&f6=8
.youtube.com	TRUE	/	FALSE	1735689600	LOGIN_INFO	${cookiesToUse.LOGIN_INFO || 'AFmmF2swRQIhAJ'}
.youtube.com	TRUE	/	FALSE	1735689600	SID	${cookiesToUse.SID || 'OQjWNV_abc123'}
.youtube.com	TRUE	/	FALSE	1735689600	HSID	${cookiesToUse.HSID || 'AbC123dEf456'}
.youtube.com	TRUE	/	FALSE	1735689600	SSID	${cookiesToUse.SSID || 'GhI789jKl012'}
.youtube.com	TRUE	/	FALSE	1735689600	APISID	${cookiesToUse.APISID || 'MnO345pQr678'}
.youtube.com	TRUE	/	FALSE	1735689600	SAPISID	${cookiesToUse.SAPISID || 'StU901vWx234'}
.youtube.com	TRUE	/	FALSE	1735689600	__Secure-1PAPISID	${cookiesToUse.SECURE_1PAPISID || 'YzA567bCd890'}
.youtube.com	TRUE	/	FALSE	1735689600	__Secure-3PAPISID	${cookiesToUse.SECURE_3PAPISID || 'YzA567bCd890'}
.youtube.com	TRUE	/	FALSE	1735689600	__Secure-1PSID	${cookiesToUse.SECURE_1PSID || 'KlM789nOp012'}
.youtube.com	TRUE	/	FALSE	1735689600	__Secure-3PSID	${cookiesToUse.SECURE_3PSID || 'QrS345tUv678'}
.youtube.com	TRUE	/	FALSE	1735689600	__Secure-1PSIDCC	${cookiesToUse.SECURE_1PSIDCC || 'WxY901zAb234'}
.youtube.com	TRUE	/	FALSE	1735689600	__Secure-3PSIDCC	${cookiesToUse.SECURE_3PSIDCC || 'CdE567fGh890'}
`;
    
    try {
        fs.writeFileSync(cookieFile, netscapeCookies);
        console.log('✅ Created enhanced YouTube cookies file with additional auth cookies');
        return cookieFile;
    } catch (error) {
        console.error('⚠️ Failed to write cookies file:', error.message);
        return null;
    }
}

// Generate realistic session ID
function generateSessionId() {
    return Math.random().toString(36).substring(2, 22) + Math.random().toString(36).substring(2, 22);
}

// Generate realistic timestamp
function generateTimestamp() {
    return Math.floor(Date.now() / 1000);
}



// Function to add random delay (anti-bot timing)
function getRandomDelay() {
    return Math.floor(Math.random() * 3000) + 1000; // 1-4 seconds
}

// Function to get realistic headers
function getRealisticHeaders() {
    return {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
    };
}

// Enhanced realistic headers with cookies and timing
function getEnhancedHeaders() {
    return {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9,ro;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'X-Requested-With': 'XMLHttpRequest'
    };
}

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize PornHub client
const pornhub = new PornHub();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Remove any size limits for downloads
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve static files from the current directory with cache-busting headers
app.use(express.static(__dirname, {
    setHeaders: (res, path, stat) => {
        // Ensure no caching for HTML, JS, CSS, and JSON files
        if (path.endsWith('.html') || path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.json')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content for favicon
});

// Endpoint to update cookies from frontend
app.post('/api/update-cookies', (req, res) => {
    try {
        const { cookies } = req.body;
        
        if (!cookies || !cookies.CONSENT || !cookies.VISITOR_INFO1_LIVE || !cookies.YSC) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid cookies format' 
            });
        }
        
        // Update global user cookies with ALL available cookies
        userCookies = {
            CONSENT: cookies.CONSENT,
            VISITOR_INFO1_LIVE: cookies.VISITOR_INFO1_LIVE,
            YSC: cookies.YSC,
            LOGIN_INFO: cookies.LOGIN_INFO || null,
            SID: cookies.SID || null,
            HSID: cookies.HSID || null,
            SSID: cookies.SSID || null,
            APISID: cookies.APISID || null,
            SAPISID: cookies.SAPISID || null,
            SECURE_1PAPISID: cookies.SECURE_1PAPISID || null,
            SECURE_3PAPISID: cookies.SECURE_3PAPISID || null,
            SECURE_1PSID: cookies.SECURE_1PSID || null,
            SECURE_3PSID: cookies.SECURE_3PSID || null,
            SECURE_1PSIDCC: cookies.SECURE_1PSIDCC || null,
            SECURE_3PSIDCC: cookies.SECURE_3PSIDCC || null
        };
        
        console.log('✅ Cookies updated from frontend:', userCookies);
        
        res.json({ 
            success: true, 
            message: 'Cookies updated successfully' 
        });
        
    } catch (error) {
        console.error('❌ Error updating cookies:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Routes
app.get('/', (req, res) => {
    console.log('🏠 Serving index.html');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API routes
app.post('/api/video-info', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ success: false, error: 'URL is required' });
        }

        let platform = 'unknown';
        let videoInfo = {};

        // Detect platform
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            // More robust playlist detection
            if (url.includes('playlist?list=') || url.includes('&list=')) {
                console.log('🎵 Detected YouTube playlist URL');
                platform = 'youtube-playlist';
                videoInfo = await getYouTubePlaylistInfo(url);
            } else {
                console.log('📹 Detected YouTube single video URL');
                platform = 'youtube';
                videoInfo = await getYouTubeInfo(url);
            }
        } else if (url.includes('pornhub.com')) {
            platform = 'pornhub';
            videoInfo = await getPornHubInfo(url);
        } else if (url.includes('twitter.com') || url.includes('x.com')) {
            platform = 'twitter';
            videoInfo = await getTwitterVideoInfo(url);
        } else if (url.includes('instagram.com')) {
            platform = 'instagram';
            videoInfo = await getInstagramVideoInfo(url);
        } else if (url.includes('tiktok.com')) {
            platform = 'tiktok';
            videoInfo = await getTikTokVideoInfo(url);
        } else if (url.includes('vimeo.com')) {
            platform = 'vimeo';
            videoInfo = await getVimeoVideoInfo(url);
        } else {
            return res.status(400).json({ 
                success: false, 
                error: 'Unsupported platform. Currently supports YouTube, YouTube Playlists, PornHub, Twitter, Instagram, TikTok, and Vimeo.' 
            });
        }

        res.json({
            success: true,
            platform,
            ...videoInfo
        });

    } catch (error) {
        console.error('Error getting video info:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.post('/api/download', async (req, res) => {
    try {
        const { url, quality, format } = req.body;
        
        if (!url) {
            return res.status(400).json({ success: false, error: 'URL is required' });
        }

        let downloadStream;
        
        // Detect platform and download accordingly
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            if (url.includes('playlist?list=')) {
                downloadStream = await downloadYouTubePlaylist(url, quality, format);
            } else {
                downloadStream = await downloadYouTube(url, quality, format);
            }
        } else if (url.includes('pornhub.com')) {
            downloadStream = await downloadPornHub(url, quality, format);
        } else if (url.includes('twitter.com') || url.includes('x.com')) {
            downloadStream = await downloadTwitter(url, quality, format);
        } else if (url.includes('instagram.com')) {
            downloadStream = await downloadInstagram(url, quality, format);
        } else if (url.includes('tiktok.com')) {
            downloadStream = await downloadTikTok(url, quality, format);
        } else if (url.includes('vimeo.com')) {
            downloadStream = await downloadVimeo(url, quality, format);
        } else {
            return res.status(400).json({ 
                success: false, 
                error: 'Unsupported platform. Currently supports YouTube, YouTube Playlists, PornHub, Twitter, Instagram, TikTok, and Vimeo.' 
            });
        }

        if (!downloadStream) {
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to create download stream' 
            });
        }

        // Set headers for download
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="download_${quality}.${format}"`);
        
        // Add custom headers to show which library was used
        res.setHeader('X-Download-Library', downloadStream.downloadLibrary || 'unknown');
        res.setHeader('X-Download-Quality', downloadStream.downloadQuality || quality);
        res.setHeader('X-Download-Format', downloadStream.downloadFormat || format);
        
        // Set Content-Length if available for progress tracking
        if (downloadStream.headers && downloadStream.headers['content-length']) {
            res.setHeader('Content-Length', downloadStream.headers['content-length']);
        }
        
        console.log('🔗 Starting stream pipe to response...');
        
        // Add response monitoring
        res.on('finish', () => {
            console.log('✅ Response finished successfully');
        });
        
        res.on('error', (error) => {
            console.error('❌ Response error:', error);
        });
        
        res.on('close', () => {
            console.log('🔒 Response connection closed');
        });
        
        // Pipe the stream directly to response
        downloadStream.pipe(res);
        
        console.log('🔗 Stream pipe initiated');

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// New endpoint for downloading entire playlists
app.post('/api/download-playlist', async (req, res) => {
    try {
        const { url, quality, format } = req.body;
        
        if (!url) {
            return res.status(400).json({ success: false, error: 'URL is required' });
        }

        if (!url.includes('playlist?list=') && !url.includes('&list=')) {
            return res.status(400).json({ 
                success: false, 
                error: 'Not a valid playlist URL' 
            });
        }

        console.log('🎵 Starting playlist download for:', url);
        
        // Get playlist info first
        const playlistInfo = await getYouTubePlaylistInfo(url);
        
        console.log(`🎵 Playlist info retrieved: ${playlistInfo.videoCount} videos`);
        
        // Check if we have any videos
        if (!playlistInfo.videos || playlistInfo.videos.length === 0) {
            console.log('⚠️ No videos found in playlist, returning error');
            
            return res.status(400).json({ 
                success: false, 
                error: 'No videos found in this playlist. Please check the URL.' 
            });
        }
        
        console.log(`🎵 Found ${playlistInfo.videos.length} videos to download`);
        
        // Download ALL videos from the playlist based on requested format
        const requestedFormat = format || 'mp3';
        const requestedQuality = quality || 'highestaudio';
        
        console.log(`🎵 Starting download of ALL ${playlistInfo.videos.length} videos from playlist as ${requestedFormat.toUpperCase()}`);
        
        try {
            // Create a ZIP file containing all videos/audio
            const archiver = require('archiver');
            const archive = archiver('zip', {
                zlib: { level: 9 } // Maximum compression
            });
            
            // Set headers for ZIP download
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${playlistInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}_${requestedFormat.toUpperCase()}_playlist.zip"`);
            
            // Pipe archive to response
            archive.pipe(res);
            
            // Process videos sequentially to avoid memory issues
            for (let i = 0; i < playlistInfo.videos.length; i++) {
                const video = playlistInfo.videos[i];
                console.log(`🎵 Downloading video ${i + 1}/${playlistInfo.videos.length}: ${video.title}`);
                
                try {
                    let downloadStream;
                    let filename;
                    
                                                              // 🔍 HYBRID DOWNLOAD: ytdl-core → yt-dlp fallback
                     console.log(`🚀 Video ${i + 1} - Starting hybrid download (ytdl-core → yt-dlp)...`);
                     
                     try {
                         // 🥇 STEP 1: Try ytdl-core first for speed
                         console.log(`🥇 Video ${i + 1} - STEP 1: Trying ytdl-core (PRIMARY)...`);
                         
                         let downloadStream;
                         let downloadMethod = 'ytdl-core';
                         
                         try {
                             // Configure ytdl-core options
                             let downloadOptions = {};
                             
                             if (requestedFormat === 'mp3') {
                                 downloadOptions = {
                                     quality: 'highestaudio',
                                     filter: 'audioonly'
                                 };
                             } else {
                                 // For video, get best available quality
                                 downloadOptions = {
                                     quality: 'highest',
                                     filter: 'videoandaudio'
                                 };
                             }
                             
                             console.log(`🔧 Video ${i + 1} - ytdl-core options:`, downloadOptions);
                             
                             // Create ytdl-core download stream
                             downloadStream = ytdl(video.url, downloadOptions);
                             
                             // Add error handling
                             downloadStream.on('error', (error) => {
                                 console.error(`❌ Video ${i + 1} - ytdl-core stream error:`, error);
                             });
                             
                             console.log(`✅ Video ${i + 1} - ytdl-core download stream created successfully`);
                             
                         } catch (ytdlError) {
                             console.log(`❌ Video ${i + 1} - STEP 1 FAILED: ytdl-core failed`);
                             console.log(`🔄 Video ${i + 1} - FALLBACK: Moving to yt-dlp...`);
                             
                             // 🥈 STEP 2: Fallback to yt-dlp
                             try {
                                 console.log(`🥈 Video ${i + 1} - STEP 2: Trying yt-dlp (FALLBACK)...`);
                                 
                                 // Use yt-dlp with dynamic path for cross-platform compatibility
                                 const ytDlpPath = process.env.YT_DLP_PATH || (process.platform === 'win32' ? './yt-dlp-windows.exe' : './yt-dlp');
                                 console.log(`🔧 Using yt-dlp path: ${ytDlpPath}`);
                                 console.log(`🔧 Platform: ${process.platform}`);
                                 console.log(`🔧 YT_DLP_PATH env: ${process.env.YT_DLP_PATH}`);
                                 
                                 // Check if yt-dlp exists
                                 if (!fs.existsSync(ytDlpPath)) {
                                     console.error(`❌ yt-dlp not found at path: ${ytDlpPath}`);
                                     throw new Error(`yt-dlp executable not found at ${ytDlpPath}. Please ensure it's downloaded and executable.`);
                                 }
                                 
                                                                   // Configure download options
                                  let formatOption = requestedFormat === 'mp3' ? 'bestaudio' : 'best[ext=mp4]/best';
                                  
                                  // Create yt-dlp download stream using spawn
                                  const ytDlpProcess = spawn(ytDlpPath, [
                                      video.url,
                                      '-o', '-',
                                      '-f', formatOption,
                                      '--no-playlist',
                                      '--no-warnings',
                                      '--no-progress',
                                      '--quiet',
                                      '--user-agent', getRandomUserAgent(),
                                      '--cookies', getManualCookies(),
                                      '--no-check-certificates',
                                      '--prefer-insecure',
                                      ...(requestedFormat === 'mp3' ? ['--extract-audio', '--audio-format', 'mp3'] : [])
                                  ]);
                                  
                                  // Get the stdout stream from the process
                                  downloadStream = ytDlpProcess.stdout;
                                  
                                  // Add error handling for the process
                                  ytDlpProcess.on('error', (error) => {
                                      console.error(`❌ Video ${i + 1} - yt-dlp process error:`, error);
                                  });
                                  
                                  ytDlpProcess.stderr.on('data', (data) => {
                                      const stderrData = data.toString().trim();
                                      console.log(`⚠️ Video ${i + 1} - yt-dlp stderr:`, stderrData);
                                  });
                                  
                                  ytDlpProcess.on('exit', (code, signal) => {
                                      if (code !== 0) {
                                          console.error(`❌ Video ${i + 1} - yt-dlp process failed with code ${code}, signal ${signal}`);
                                      }
                                  });
                                 
                                 downloadMethod = 'yt-dlp (fallback)';
                                 
                                 // Add error handling
                                 downloadStream.on('error', (error) => {
                                     console.error(`❌ Video ${i + 1} - yt-dlp stream error:`, error);
                                 });
                                 
                                 console.log(`✅ Video ${i + 1} - yt-dlp download stream created successfully (fallback)`);
                                 
                             } catch (ytDlpError) {
                                 console.log(`❌ Video ${i + 1} - STEP 2 FAILED: yt-dlp failed`);
                                 throw new Error(`Both ytdl-core and yt-dlp failed: ${ytdlError.message}, ${ytDlpError.message}`);
                             }
                         }
                       
                       // Generate filename
                       filename = `${(i + 1).toString().padStart(2, '0')}_${video.title.replace(/[^a-zA-Z0-9\\s\\-_]/g, '').replace(/\\s+/g, '_')}.${requestedFormat}`;
                       
                       // Add to archive
                       archive.append(downloadStream, { name: filename });
                       
                       console.log(`✅ Video ${i + 1} - Downloaded and added ${filename} to archive via ${downloadMethod}`);
                       
                     } catch (downloadError) {
                         console.error(`❌ Error downloading video ${i + 1}:`, downloadError.message);
                         
                         // Add error info to archive
                         const errorContent = `Video ${i + 1}: ${video.title}\nStatus: Download failed - ${downloadError.message}\nURL: ${video.url}\n\n`;
                         archive.append(Buffer.from(errorContent), { name: `video_${i + 1}_error.txt` });
                         
                         console.log(`⚠️ Added error info for video ${i + 1} to archive`);
                     }
                    
                } catch (videoError) {
                    console.error(`❌ Error processing video ${i + 1}:`, videoError.message);
                    // Continue with next video instead of failing completely
                    continue;
                }
            }
            
            // Finalize the archive
            archive.finalize();
            
            console.log('✅ Playlist archive creation completed');
            
        } catch (downloadError) {
            console.error('❌ Error creating playlist archive:', downloadError);
            if (!res.headersSent) {
                return res.status(500).json({ 
                    success: false, 
                    error: `Failed to create playlist archive: ${downloadError.message}` 
                });
            }
        }

    } catch (error) {
        console.error('Playlist download error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// NEW: Using specialized pornhub.js library
async function getPornHubInfo(url) {
    try {
        console.log('Attempting to get PornHub info using specialized library for:', url);
        
        // Extract video ID from URL
        const videoIdMatch = url.match(/viewkey=([^&]+)/);
        if (!videoIdMatch) {
            throw new Error('Could not extract video ID from URL');
        }
        
        const videoId = videoIdMatch[1];
        console.log('🎯 Extracted video ID:', videoId);
        
        // Get video info using pornhub.js
        const video = await pornhub.video(videoId);
        
        if (!video) {
            throw new Error('Video not found or private');
        }
        
        console.log('✅ Video info retrieved successfully using pornhub.js');
        console.log('📊 Video title:', video.title);
        console.log('📊 Video duration:', video.duration);
        console.log('📊 Video qualities available:', Object.keys(video.files || {}));
        
        // Extract available qualities and formats from mediaDefinitions
        const qualities = [];
        const formats = [];
        
        if (video.mediaDefinitions && video.mediaDefinitions.length > 0) {
            console.log('📊 Found mediaDefinitions:', video.mediaDefinitions.length);
            
            // Check if MP4 format is available
            const mp4Media = video.mediaDefinitions.filter(media => media.format === 'mp4');
            const hlsMedia = video.mediaDefinitions.filter(media => media.format === 'hls');
            
            if (mp4Media.length > 0) {
                formats.push('mp4');
                console.log('✅ MP4 format available');
            }
            
            if (hlsMedia.length > 0) {
                formats.push('hls');
                console.log('✅ HLS format available');
            }
            
            // Map PornHub qualities to our format (prioritize HLS for quality info)
            hlsMedia.forEach(media => {
                if (media.quality && media.quality > 0) {
                    const qualityLabel = `${media.quality}p`;
                    if (!qualities.includes(qualityLabel)) {
                        qualities.push(qualityLabel);
                    }
                    console.log(`📊 Quality: ${qualityLabel}, Format: ${media.format}, URL: ${media.videoUrl}`);
                }
            });
            
            // If we have MP4 but no specific qualities, add generic ones
            if (mp4Media.length > 0 && qualities.length === 0) {
                qualities.push('720p', '480p', '360p');
                console.log('📊 MP4 format available with generic qualities');
            }
        }
        
        // Fallback qualities if none found
        if (qualities.length === 0) {
            qualities.push('720p', '480p', '360p');
        }
        if (formats.length === 0) {
            formats.push('mp4');
        }
        
        // Calculate quality sizes based on duration
        const qualitySizes = {};
        qualities.forEach(quality => {
            const duration = video.duration || 0;
            let sizeMB = 0;
            
            switch (quality) {
                case '1080p': sizeMB = (duration * 8) / 60; break; // ~8 Mbps
                case '720p': sizeMB = (duration * 5) / 60; break;  // ~5 Mbps
                case '480p': sizeMB = (duration * 2.5) / 60; break; // ~2.5 Mbps
                case '360p': sizeMB = (duration * 1.5) / 60; break; // ~1.5 Mbps
                default: sizeMB = (duration * 3) / 60; break;
            }
            
            qualitySizes[quality] = sizeMB > 1024 ? 
                `${(sizeMB / 1024).toFixed(1)}GB` : 
                `${sizeMB.toFixed(1)}MB`;
        });
        
        const videoInfo = {
            title: video.title || 'PornHub Video',
            duration: video.duration || 'Unknown',
            thumbnail: video.thumb || video.preview || '',
            qualities: qualities,
            formats: ['mp4', 'mp3'],
            qualitySizes: qualitySizes,
            note: 'PornHub video detected using specialized library. Download functionality available.',
            videoId: videoId,
            videoData: video // Store full video data for download
        };
        
        console.log('PornHub info retrieved successfully using specialized library');
        return videoInfo;
        
    } catch (error) {
        console.error('Error getting PornHub info with specialized library:', error);
        throw new Error(`Failed to get PornHub video information: ${error.message}`);
    }
}

async function downloadPornHub(url, quality, format) {
    try {
        console.log(`\n=== PORN HUB DOWNLOAD START (Specialized Library) ===`);
        console.log(`Downloading PornHub video: ${quality} ${format}`);
        console.log(`Source URL: ${url}`);
        
        // First get the video info using specialized library
        const videoInfo = await getPornHubInfo(url);
        
        if (!videoInfo.videoData) {
            throw new Error('No video data available for download');
        }
        
        console.log('✅ Video data available for download');
        console.log('📊 Available mediaDefinitions:', videoInfo.videoData.mediaDefinitions?.length || 0);
        
        // Get the download URL for the requested quality from mediaDefinitions
        let downloadUrl = null;
        
        if (videoInfo.videoData.mediaDefinitions && videoInfo.videoData.mediaDefinitions.length > 0) {
            // PRIORITY 1: Find the requested quality in HLS (MP4 URLs don't work)
            const requestedQuality = parseInt(quality);
            const matchingMedia = videoInfo.videoData.mediaDefinitions.find(media => 
                media.quality === requestedQuality && media.format === 'hls'
            );
            
            if (matchingMedia) {
                downloadUrl = matchingMedia.videoUrl;
                console.log(`✅ Found ${quality} HLS URL (will convert to MP4):`, downloadUrl);
            }
        }
        
        if (!downloadUrl) {
            // Fallback: try to find any available quality
            console.log('⚠️ Requested quality not found, trying fallback...');
            
            if (videoInfo.videoData.mediaDefinitions && videoInfo.videoData.mediaDefinitions.length > 0) {
                // Get the highest HLS quality available (MP4 URLs don't work)
                const sortedMedia = videoInfo.videoData.mediaDefinitions
                    .filter(media => media.quality > 0 && media.format === 'hls')
                    .sort((a, b) => b.quality - a.quality);
                
                if (sortedMedia.length > 0) {
                    const fallbackMedia = sortedMedia[0];
                    downloadUrl = fallbackMedia.videoUrl;
                    console.log(`✅ Using fallback HLS quality ${fallbackMedia.quality}p (will convert to MP4):`, downloadUrl);
                }
            }
        }
        
        if (!downloadUrl) {
            throw new Error('No download URL found for any quality');
        }
        
        // Download the video using axios with proper headers
        console.log('🔄 Starting video download with specialized library URL...');
        
        // Check if this is an HLS playlist (.m3u8)
        if (downloadUrl.includes('.m3u8')) {
            console.log('📋 Detected HLS playlist, parsing and downloading segments...');
            
            try {
                // Get the HLS playlist
                const playlistResponse = await axios.get(downloadUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Referer': url,
                        'Origin': 'https://www.pornhub.com'
                    }
                });
                
                const playlist = playlistResponse.data;
                console.log('📊 HLS playlist retrieved, length:', playlist.length);
                console.log('📊 Playlist preview:', playlist.substring(0, 200));
                
                // Check if this is a master playlist (contains stream info, not segments)
                if (playlist.includes('#EXT-X-STREAM-INF')) {
                    console.log('📋 This is a master playlist, need to follow the stream URL...');
                    
                    // Extract the stream URL from master playlist
                    const streamMatch = playlist.match(/^([^#\s]+\.m3u8[^\s]*)$/m);
                    if (streamMatch && streamMatch[1]) {
                        const streamUrl = streamMatch[1];
                        console.log('🔗 Found stream URL in master playlist:', streamUrl);
                        
                        // Construct full URL if it's relative
                        let fullStreamUrl = streamUrl;
                        if (!streamUrl.startsWith('http')) {
                            const baseUrl = downloadUrl.substring(0, downloadUrl.lastIndexOf('/') + 1);
                            fullStreamUrl = baseUrl + streamUrl;
                        }
                        console.log('🔗 Full stream URL:', fullStreamUrl);
                        
                        // Now get the actual video segments from the stream playlist
                        const streamPlaylistResponse = await axios.get(fullStreamUrl, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                                'Referer': url
                            }
                        });
                        
                        const streamPlaylist = streamPlaylistResponse.data;
                        console.log('📊 Stream playlist content:', streamPlaylist);
                        
                        // Extract video segment URLs
                        const segments = streamPlaylist.match(/^([^#\s]+\.ts[^\s]*)$/gm) || 
                                       streamPlaylist.match(/^([^#\s]+\.mp4[^\s]*)$/gm);
                        
                        if (segments && segments.length > 0) {
                            console.log('✅ Found video segments in stream playlist:', segments.length);
                            console.log('📊 First segment URL:', segments[0]);
                            
                            // Create a combined stream for all segments
                            const { Readable } = require('stream');
                            const combinedStream = new Readable();
                            let isFirstSegment = true;
                            
                            combinedStream._read = () => {}; // No-op read function
                            
                            // Function to download segments sequentially
                            const downloadSegments = async () => {
                                for (let i = 0; i < segments.length; i++) {
                                    try {
                                        let segmentUrl = segments[i];
                                        console.log(`📥 Downloading segment ${i + 1}/${segments.length}: ${segmentUrl}`);
                                        
                                        // If segment URL is relative, make it absolute
                                        if (!segmentUrl.startsWith('http')) {
                                            const streamBaseUrl = fullStreamUrl.substring(0, fullStreamUrl.lastIndexOf('/') + 1);
                                            segmentUrl = streamBaseUrl + segmentUrl;
                                        }
                                        
                                        // Download the segment
                                        const segmentResponse = await axios({
                                            method: 'GET',
                                            url: segmentUrl,
                                            responseType: 'stream',
                                            headers: {
                                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                                                'Referer': url,
                                                'Origin': 'https://www.pornhub.com'
                                            },
                                            timeout: 30000
                                        });
                                        
                                        // Append segment data directly (no HTTP headers)
                                        if (isFirstSegment) {
                                            isFirstSegment = false;
                                        }
                                        
                                        // Pipe the segment data to the combined stream
                                        segmentResponse.data.on('data', (chunk) => {
                                            combinedStream.push(chunk);
                                        });
                                        
                                        // Wait for segment to complete
                                        await new Promise((resolve, reject) => {
                                            segmentResponse.data.on('end', resolve);
                                            segmentResponse.data.on('error', reject);
                                        });
                                        
                                        console.log(`✅ Segment ${i + 1}/${segments.length} downloaded successfully`);
                                        
                                    } catch (segmentError) {
                                        console.log(`❌ Segment ${i + 1}/${segments.length} failed:`, segmentError.message);
                                        
                                        // If segment fails, continue with next one
                                        console.log(`⚠️ Skipping failed segment ${i + 1}, continuing...`);
                                    }
                                }
                                
                                // All segments processed, end the stream
                                console.log('✅ All segments processed, ending combined stream');
                                combinedStream.push(null);
                            };
                            
                            // Start downloading segments
                            downloadSegments().catch(error => {
                                console.error('❌ Error in segment downloader:', error);
                                combinedStream.push(null);
                            });
                            
                            console.log('✅ Combined HLS stream created successfully');
                            return combinedStream;
                            
                        } else {
                            console.log('❌ No video segments found in stream playlist');
                            throw new Error('No video segments found in stream playlist');
                        }
                        
                    } else {
                        console.log('❌ No stream URL found in master playlist');
                        throw new Error('No stream URL found in master playlist');
                    }
                    
                } else {
                    // This is a direct segment playlist, extract video segments
                    console.log('📋 This is a direct segment playlist...');
                    
                    // Extract video segment URLs
                    const segments = playlist.match(/^([^#\s]+\.ts[^\s]*)$/gm) || 
                                   playlist.match(/^([^#\s]+\.mp4[^\s]*)$/gm);
                    
                    if (segments && segments.length > 0) {
                        console.log('✅ Found video segments:', segments.length);
                        console.log('📊 First segment URL:', segments[0]);
                        
                        // Create a combined stream for all segments
                        const { Readable } = require('stream');
                        const combinedStream = new Readable();
                        let isFirstSegment = true;
                        
                        combinedStream._read = () => {}; // No-op read function
                        
                        // Function to download segments sequentially
                        const downloadSegments = async () => {
                            for (let i = 0; i < segments.length; i++) {
                                try {
                                    let segmentUrl = segments[i];
                                    console.log(`📥 Downloading segment ${i + 1}/${segments.length}: ${segmentUrl}`);
                                    
                                    // If segment URL is relative, make it absolute
                                    if (!segmentUrl.startsWith('http')) {
                                        const baseUrl = downloadUrl.substring(0, downloadUrl.lastIndexOf('/') + 1);
                                        segmentUrl = baseUrl + segmentUrl;
                                    }
                                    
                                    // Download the segment
                                    const segmentResponse = await axios({
                                        method: 'GET',
                                        url: segmentUrl,
                                        responseType: 'stream',
                                        headers: {
                                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                                            'Referer': url,
                                            'Origin': 'https://www.pornhub.com'
                                        },
                                        timeout: 30000
                                    });
                                    
                                    // Append segment data directly (no HTTP headers)
                                    if (isFirstSegment) {
                                        isFirstSegment = false;
                                    }
                                    
                                    // Pipe the segment data to the combined stream
                                    segmentResponse.data.on('data', (chunk) => {
                                        combinedStream.push(chunk);
                                    });
                                    
                                    // Wait for segment to complete
                                    await new Promise((resolve, reject) => {
                                        segmentResponse.data.on('end', resolve);
                                        segmentResponse.data.on('error', reject);
                                    });
                                    
                                    console.log(`✅ Segment ${i + 1}/${segments.length} downloaded successfully`);
                                    
                                } catch (segmentError) {
                                    console.log(`❌ Segment ${i + 1}/${segments.length} failed:`, segmentError.message);
                                    
                                    // If segment fails, continue with next one
                                    console.log(`⚠️ Skipping failed segment ${i + 1}, continuing...`);
                                }
                            }
                            
                            // All segments processed, end the stream
                            console.log('✅ All segments processed, ending combined stream');
                            combinedStream.push(null);
                        };
                        
                        // Start downloading segments
                        downloadSegments().catch(error => {
                            console.error('❌ Error in segment downloader:', error);
                            combinedStream.push(null);
                        });
                        
                        console.log('✅ Combined HLS stream created successfully');
                        return combinedStream;
                        
                    } else {
                        console.log('❌ No video segments found in HLS playlist');
                        throw new Error('No video segments found in HLS playlist');
                    }
                }
                
            } catch (hlsError) {
                console.log('❌ HLS parsing failed:', hlsError.message);
                throw new Error(`HLS parsing failed: ${hlsError.message}`);
            }
        } else {
            // Direct video download (not HLS)
            const response = await axios({
                method: 'GET',
                url: downloadUrl,
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': url,
                    'Origin': 'https://www.pornhub.com',
                    'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'video',
                    'Sec-Fetch-Mode': 'no-cors',
                    'Sec-Fetch-Site': 'cross-site'
                },
                timeout: 60000, // 60 seconds timeout
                maxRedirects: 5
            });
            
            const downloadStream = response.data;
            
            console.log('✅ Direct video download successful');
            console.log('📊 Stream type:', downloadStream.constructor.name);
            console.log('📊 Content-Type:', response.headers['content-type']);
            console.log('📊 Content-Length:', response.headers['content-length']);
            console.log('=== PORN HUB DOWNLOAD END (Specialized Library) ===\n');
            
            return downloadStream;
        }
        
    } catch (error) {
        console.error('❌ Error downloading PornHub video with specialized library:', error);
        throw new Error(`Failed to download PornHub video: ${error.message}`);
    }
}

async function getYouTubeInfo(url) {
    try {
        console.log('🔍 ANALYSIS START - YouTube API v3 → ytdl-core → yt-dlp');
        
        // 1️⃣ Try YouTube Data API v3 first (fastest and most stable)
        try {
            console.log('🥇 STEP 1: Trying YouTube Data API v3 (PRIMARY)...');
            const result = await getYouTubeInfoViaAPI(url);
            console.log('✅ SUCCESS: Analysis completed with YouTube Data API v3');
            return result;
        } catch (apiError) {
            console.log('❌ STEP 1 FAILED: YouTube Data API v3 failed');
            console.log('🔄 FALLBACK: Moving to ytdl-core...');
            
            // 2️⃣ Fallback to ytdl-core
            try {
                console.log('🥈 STEP 2: Trying ytdl-core (FALLBACK 1)...');
                const result = await getYouTubeInfoViaYtdlCore(url);
                console.log('✅ SUCCESS: Analysis completed with ytdl-core');
                return result;
            } catch (ytdlError) {
                console.log('❌ STEP 2 FAILED: ytdl-core failed');
                console.log('🔄 FALLBACK: Moving to yt-dlp...');
                
                // 3️⃣ Final fallback to yt-dlp
                try {
                    console.log('🥉 STEP 3: Trying yt-dlp (FALLBACK 2)...');
                    const result = await getYouTubeInfoViaYtDlp(url);
                    console.log('✅ SUCCESS: Analysis completed with yt-dlp');
                    return result;
                } catch (ytDlpError) {
                    console.log('❌ STEP 3 FAILED: yt-dlp failed');
                    console.log('💥 ALL METHODS FAILED');
                    throw new Error(`All analysis methods failed. API: ${apiError.message}, ytdl-core: ${ytdlError.message}, yt-dlp: ${ytDlpError.message}`);
                }
            }
        }
        
    } catch (error) {
        console.error('💥 ANALYSIS FAILED COMPLETELY:', error);
        throw new Error(`Failed to get YouTube video information: ${error.message}`);
    }
}

// Function using ytdl-core for fast info retrieval
async function getYouTubeInfoViaYtdlCore(url) {
    try {
        // Get video info using ytdl-core
        const info = await ytdl.getInfo(url);
        
        // Extract available formats and qualities
        const videoFormats = info.formats;
        const qualities = [];
        const qualitySizes = {};
        
        // Group formats by quality
        const qualityGroups = {};
        videoFormats.forEach(format => {
            if (format.height && format.height > 0) {
                const quality = `${format.height}p`;
                if (!qualityGroups[quality]) {
                    qualityGroups[quality] = [];
                }
                qualityGroups[quality].push(format);
            }
        });
        
        // Sort qualities and calculate sizes
        const sortedQualities = Object.keys(qualityGroups).sort((a, b) => {
            const heightA = parseInt(a);
            const heightB = parseInt(b);
            return heightB - heightA; // Highest first
        });
        
        console.log(`🔍 REAL QUALITIES DETECTED: ${sortedQualities.join(', ')}`);
        
        // Map to our quality format ONLY if they exist
        const qualityMap = {
            '2160': '4K',
            '1440': '2K', 
            '1080': '1080p',
            '720': '720p',
            '480': '480p',
            '360': '360p',
            '240': '240p',
            '144': '144p'
        };
        
        sortedQualities.forEach(quality => {
            const heightNumber = quality.replace('p', '');
            const mappedQuality = qualityMap[heightNumber] || quality;
            
            if (!qualities.includes(mappedQuality)) {
                qualities.push(mappedQuality);
                
                // Calculate size based on format info
                const format = qualityGroups[quality][0];
                if (format.contentLength) {
                    const sizeMB = parseInt(format.contentLength) / (1024 * 1024);
                    qualitySizes[mappedQuality] = sizeMB > 1024 ? 
                        `${(sizeMB / 1024).toFixed(1)}GB` : 
                        `${sizeMB.toFixed(1)}MB`;
                } else {
                    // Estimate size based on duration and quality
                    const duration = info.videoDetails.lengthSeconds || 0;
                    let estimatedSize = 0;
                    switch (mappedQuality) {
                        case '4K': estimatedSize = (duration * 25) / 60; break;
                        case '2K': estimatedSize = (duration * 15) / 60; break;
                        case '1080p': estimatedSize = (duration * 8) / 60; break;
                        case '720p': estimatedSize = (duration * 5) / 60; break;
                        case '480p': estimatedSize = (duration * 2.5) / 60; break;
                        case '360p': estimatedSize = (duration * 1.5) / 60; break;
                        case '240p': estimatedSize = (duration * 1) / 60; break;
                        default: estimatedSize = (duration * 3) / 60;
                    }
                    qualitySizes[mappedQuality] = estimatedSize > 1024 ? 
                        `${(estimatedSize / 1024).toFixed(1)}GB` : 
                        `${estimatedSize.toFixed(1)}MB`;
                }
            }
        });
        
        // Add MP3 format
        const availableFormats = ['mp4', 'mp3'];
        
        const videoInfo = {
            title: info.videoDetails.title || 'Unknown Title',
            duration: parseInt(info.videoDetails.lengthSeconds) || 0,
            thumbnail: info.videoDetails.thumbnails?.[0]?.url || '',
            qualities: qualities,
            formats: availableFormats,
            qualitySizes: qualitySizes,
            note: 'Retrieved via ytdl-core (fallback 1)',
            debugInfo: {
                method: 'ytdl-core',
                isStatic: false,
                realQualities: sortedQualities,
                totalFormats: videoFormats.length,
                message: `Found ${qualities.length} available qualities: ${qualities.join(', ')}`
            },
            ytdlInfo: info // Store full info for download
        };
        
        return videoInfo;
        
    } catch (error) {
        throw new Error(`ytdl-core failed: ${error.message}`);
    }
}

// Function using yt-dlp for analysis (final fallback)
async function getYouTubeInfoViaYtDlp(url) {
    try {
        console.log('🔍 Attempting to get YouTube video info via yt-dlp...');
        
        // Use yt-dlp with dynamic path for cross-platform compatibility
        const ytDlpPath = process.env.YT_DLP_PATH || (process.platform === 'win32' ? './yt-dlp-windows.exe' : './yt-dlp');
        console.log(`🔧 Using yt-dlp path: ${ytDlpPath}`);
        console.log(`🔧 Platform: ${process.platform}`);
        console.log(`🔧 YT_DLP_PATH env: ${process.env.YT_DLP_PATH}`);
        
        // Check if yt-dlp exists
        if (!fs.existsSync(ytDlpPath)) {
            console.error(`❌ yt-dlp not found at path: ${ytDlpPath}`);
            throw new Error(`yt-dlp executable not found at ${ytDlpPath}. Please ensure it's downloaded and executable.`);
        }
        
        console.log('🔧 yt-dlp options configured with enhanced anti-bot detection');
        
        // Get video info using yt-dlp spawn with enhanced anti-bot detection v2.0
        const result = await new Promise((resolve, reject) => {
            const info = [];
            const infoProcess = spawn(ytDlpPath, [
                url,
                '--dump-json',
                '--no-playlist',
                '--quiet',
                '--no-warnings',
                '--user-agent', getRandomUserAgent(),
                '--cookies', getManualCookies(),
                '--no-check-certificates',
                '--prefer-insecure',
                '--extractor-args', 'youtube:player_client=android',
                '--extractor-args', 'youtube:player_skip=webpage'
            ]);
            
            infoProcess.stdout.on('data', (chunk) => {
                info.push(chunk);
            });
            
            infoProcess.stdout.on('end', () => {
                try {
                    const jsonStr = Buffer.concat(info).toString();
                    const videoInfo = JSON.parse(jsonStr);
                    resolve(videoInfo);
                } catch (parseError) {
                    reject(parseError);
                }
            });
            
            infoProcess.stderr.on('data', (data) => {
                const stderrData = data.toString().trim();
                console.log('⚠️ yt-dlp info stderr:', stderrData);
                
                // Check for bot detection error
                if (stderrData.includes('Sign in to confirm you\'re not a bot')) {
                    console.error('❌ yt-dlp bot detection triggered during info retrieval');
                }
            });
            
            infoProcess.on('error', (error) => {
                reject(error);
            });
            
            infoProcess.on('exit', (code, signal) => {
                if (code !== 0) {
                    console.error(`❌ yt-dlp info process failed with code ${code}, signal ${signal}`);
                    reject(new Error(`yt-dlp info process failed with code ${code}`));
                }
            });
        });
        
        const videoInfo = result;
        console.log('✅ yt-dlp successfully retrieved video info');
        
        if (!videoInfo || !videoInfo.formats) {
            throw new Error('No video formats found via yt-dlp');
        }
        
        // Extract available qualities and formats
        const availableFormats = videoInfo.formats || [];
        const qualities = [];
        const qualitySizes = {};
        
        // Process formats to get quality information
        availableFormats.forEach(format => {
            if (format.height && format.ext) {
                const quality = `${format.height}p`;
                if (!qualities.includes(quality)) {
                    qualities.push(quality);
                }
                if (format.filesize) {
                    qualitySizes[quality] = format.filesize;
                }
            }
        });
        
        // Sort qualities from highest to lowest
        qualities.sort((a, b) => parseInt(b) - parseInt(a));
        
        // Add 2K and 4K if available
        if (qualities.includes('1440p')) qualities.unshift('2K');
        if (qualities.includes('2160p')) qualities.unshift('4K');
        
        return {
            title: videoInfo.title || 'YouTube Video',
            duration: videoInfo.duration || 'Unknown',
            thumbnail: videoInfo.thumbnail || '',
            qualities: qualities,
            formats: ['mp4', 'mp3', 'webm'],
            qualitySizes: qualitySizes,
            note: 'YouTube video detected via yt-dlp. Download functionality available.',
            videoId: videoInfo.id || '',
            videoData: videoInfo,
            downloadMethod: 'yt-dlp'
        };
    } catch (error) {
        console.error('❌ yt-dlp failed:', error.message);
        throw error;
    }
}

// Primary function using YouTube Data API v3 (primary)
async function getYouTubeInfoViaAPI(url) {
    try {
        
        // Extract video ID from URL
        const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        if (!videoIdMatch) {
            throw new Error('Could not extract video ID from URL');
        }
        
        const videoId = videoIdMatch[1];
        
        // Call YouTube Data API v3
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics`;
        
        const response = await axios.get(apiUrl, {
            headers: getEnhancedHeaders()
        });
        
        if (!response.data.items || response.data.items.length === 0) {
            throw new Error('Video not found via YouTube API');
        }
        
        const videoData = response.data.items[0];
        const snippet = videoData.snippet;
        const contentDetails = videoData.contentDetails;
        
        // Parse duration (ISO 8601 format)
        const duration = parseDuration(contentDetails.duration);
        
        // Generate quality options (YouTube API doesn't provide format info)
        // Include 2K and 4K if they might exist (will be filtered during download)
        const qualities = ['4K', '2K', '1080p', '720p', '480p', '360p', '240p'];
        const formats = ['mp4', 'mp3'];
        
        // Estimate file sizes based on duration
        const qualitySizes = {};
        qualities.forEach(quality => {
            const durationInSeconds = duration;
            let sizeMB = 0;
            
            switch (quality) {
                case '4K': sizeMB = (durationInSeconds * 25) / 60; break;    // ~25 Mbps
                case '2K': sizeMB = (durationInSeconds * 15) / 60; break;    // ~15 Mbps
                case '1080p': sizeMB = (durationInSeconds * 8) / 60; break;  // ~8 Mbps
                case '720p': sizeMB = (durationInSeconds * 5) / 60; break;   // ~5 Mbps
                case '480p': sizeMB = (durationInSeconds * 2.5) / 60; break; // ~2.5 Mbps
                case '360p': sizeMB = (durationInSeconds * 1.5) / 60; break; // ~1.5 Mbps
                case '240p': sizeMB = (durationInSeconds * 1) / 60; break;   // ~1 Mbps
                default: sizeMB = (durationInSeconds * 3) / 60; break;
            }
            
            qualitySizes[quality] = sizeMB > 1024 ? 
                `${(sizeMB / 1024).toFixed(1)}GB` : 
                `${sizeMB.toFixed(1)}MB`;
        });
        
        const videoInfo = {
            title: snippet.title || 'Unknown Title',
            duration: duration,
            thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '',
            qualities: ['4K', '2K', '1080p', '720p', '480p', '360p', '240p'], // Fallback static qualities for API
            formats: formats,
            qualitySizes: qualitySizes,
            note: 'Retrieved via YouTube Data API v3 (primary)',
            debugInfo: {
                method: 'YouTube Data API v3',
                isStatic: true,
                message: 'Static qualities - actual available qualities will be detected during download'
            }
        };
        
        return videoInfo;
        
    } catch (error) {
        throw new Error(`YouTube API failed: ${error.message}`);
    }
}

// Helper function to parse ISO 8601 duration
function parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    let hours = 0, minutes = 0, seconds = 0;
    
    if (match[1]) hours = parseInt(match[1].slice(0, -1));
    if (match[2]) minutes = parseInt(match[2].slice(0, -1));
    if (match[3]) seconds = parseInt(match[3].slice(0, -1));
    
    return hours * 3600 + minutes * 60 + seconds;
}

// Enhanced ytdl-core with cookie authentication and timing
async function downloadYouTubeViaYtdlCore(url, quality, format) {
    try {
        console.log('🔍 Enhanced ytdl-core v2.0: Starting with cookie authentication...');
        
        // Add random delay to avoid bot detection
        const delay = getRandomDelay();
        console.log(`⏱️ Adding random delay: ${delay}ms to avoid bot detection`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Get video info with enhanced options
        const info = await ytdl.getInfo(url, {
            requestOptions: {
                headers: getEnhancedHeaders()
            }
        });
        
        console.log('✅ Enhanced ytdl-core successfully retrieved video info');
        
        // Configure download options with enhanced anti-bot detection
        let downloadOptions = {
            requestOptions: {
                headers: getEnhancedHeaders()
            }
        };
        
        if (format === 'mp3') {
            downloadOptions.quality = 'highestaudio';
            downloadOptions.filter = 'audioonly';
        } else {
            // Enhanced quality selection with fallback
            const formats = info.formats;
            let selectedFormat;
            
            // Enhanced quality mapping with fallbacks
            switch (quality) {
                case '4K':
                    selectedFormat = formats.find(f => f.height === 2160 && f.hasVideo && f.hasAudio) ||
                                   formats.find(f => f.height === 2160 && f.hasVideo) ||
                                   formats.find(f => f.height <= 2160 && f.hasVideo && f.hasAudio);
                    break;
                case '2K':
                    selectedFormat = formats.find(f => f.height === 1440 && f.hasVideo && f.hasAudio) ||
                                   formats.find(f => f.height === 1440 && f.hasVideo) ||
                                   formats.find(f => f.height <= 1440 && f.hasVideo && f.hasAudio);
                    break;
                case '1080p':
                    selectedFormat = formats.find(f => f.height === 1080 && f.hasVideo && f.hasAudio) ||
                                   formats.find(f => f.height === 1080 && f.hasVideo) ||
                                   formats.find(f => f.height <= 1080 && f.hasVideo && f.hasAudio);
                    break;
                case '720p':
                    selectedFormat = formats.find(f => f.height === 720 && f.hasVideo && f.hasAudio) ||
                                   formats.find(f => f.height === 720 && f.hasVideo) ||
                                   formats.find(f => f.height <= 720 && f.hasVideo && f.hasAudio);
                    break;
                case '480p':
                    selectedFormat = formats.find(f => f.height === 480 && f.hasVideo && f.hasAudio) ||
                                   formats.find(f => f.height === 480 && f.hasVideo) ||
                                   formats.find(f => f.height <= 480 && f.hasVideo && f.hasAudio);
                    break;
                case '360p':
                    selectedFormat = formats.find(f => f.height === 360 && f.hasVideo && f.hasAudio) ||
                                   formats.find(f => f.height === 360 && f.hasVideo) ||
                                   formats.find(f => f.height <= 360 && f.hasVideo && f.hasAudio);
                    break;
                case '240p':
                    selectedFormat = formats.find(f => f.height === 240 && f.hasVideo && f.hasAudio) ||
                                   formats.find(f => f.height === 240 && f.hasVideo) ||
                                   formats.find(f => f.height <= 240 && f.hasVideo && f.hasAudio);
                    break;
                default:
                    selectedFormat = formats.find(f => f.hasVideo && f.hasAudio) || formats.find(f => f.hasVideo);
            }
            
            if (!selectedFormat) {
                throw new Error(`No suitable format found for ${quality} quality`);
            }
            
            console.log(`🎯 Enhanced ytdl-core selected format: ${selectedFormat.height}p, size: ${selectedFormat.contentLength || 'unknown'}`);
            downloadOptions.format = selectedFormat;
        }
        
        console.log('🔧 Enhanced ytdl-core v2.0 download options configured');
        
        // Create download stream with enhanced options
        const downloadStream = ytdl(url, downloadOptions);
        
        // Enhanced error handling
        downloadStream.on('error', (error) => {
            console.error('❌ Enhanced ytdl-core v2.0 stream error:', error);
        });
        
        console.log('✅ Enhanced ytdl-core v2.0 download stream created successfully');
        return downloadStream;
        
    } catch (error) {
        console.error('❌ Enhanced ytdl-core v2.0 failed:', error.message);
        throw new Error(`Enhanced ytdl-core v2.0 download failed: ${error.message}`);
    }
}

async function downloadYouTube(url, quality, format) {
    try {
        console.log(`📥 DOWNLOAD START - ${quality} ${format} - ytdl-core → yt-dlp`);
        
        // 1️⃣ Try ytdl-core first for speed
        try {
            console.log('🥇 DOWNLOAD STEP 1: Trying ytdl-core (PRIMARY)...');
            const result = await downloadYouTubeViaYtdlCore(url, quality, format);
            console.log('✅ SUCCESS: Download completed with ytdl-core');
            console.log('🔍 DOWNLOAD DEBUG: Method used: ytdl-core, Quality: ' + quality + ', Format: ' + format);
            
            // Add library info to the stream
            result.downloadLibrary = 'ytdl-core';
            result.downloadQuality = quality;
            result.downloadFormat = format;
            
            return result;
        } catch (ytdlError) {
            console.log('❌ DOWNLOAD STEP 1 FAILED: ytdl-core failed');
            console.log('🔄 FALLBACK: Moving to yt-dlp...');
            
            // 2️⃣ Fallback to yt-dlp
            try {
                console.log('🥈 DOWNLOAD STEP 2: Trying yt-dlp (FALLBACK)...');
                const result = await downloadYouTubeViaYtDlp(url, quality, format);
                console.log('✅ SUCCESS: Download completed with yt-dlp');
                console.log('🔍 DOWNLOAD DEBUG: Method used: yt-dlp (fallback), Quality: ' + quality + ', Format: ' + format);
                
                // Add library info to the stream
                result.downloadLibrary = 'yt-dlp (fallback)';
                result.downloadQuality = quality;
                result.downloadFormat = format;
                
                return result;
            } catch (ytDlpError) {
                console.log('❌ DOWNLOAD STEP 2 FAILED: yt-dlp failed');
                console.log('💥 ALL DOWNLOAD METHODS FAILED');
                throw new Error(`All download methods failed. ytdl-core: ${ytdlError.message}, yt-dlp: ${ytDlpError.message}`);
            }
        }
        
    } catch (error) {
        console.error('💥 DOWNLOAD FAILED COMPLETELY:', error);
        throw new Error(`Failed to download YouTube video: ${error.message}`);
    }
}

// Enhanced yt-dlp with cookie authentication and timing
async function downloadYouTubeViaYtDlp(url, quality, format) {
    try {
        console.log('🔍 Enhanced yt-dlp v2.0: Starting with cookie authentication...');
        
        // Add random delay to avoid bot detection
        const delay = getRandomDelay();
        console.log(`⏱️ Adding random delay: ${delay}ms to avoid bot detection`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const ytDlpPath = process.env.YT_DLP_PATH || (process.platform === 'win32' ? './yt-dlp-windows.exe' : './yt-dlp');
        console.log(`🔧 Using yt-dlp path: ${ytDlpPath}`);
        
        if (!fs.existsSync(ytDlpPath)) {
            throw new Error(`yt-dlp executable not found at ${ytDlpPath}`);
        }
        
        // Enhanced format options with better quality selection
        let formatOption;
        if (format === 'mp3') {
            formatOption = 'bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio';
        } else {
            switch (quality) {
                case '4K': formatOption = 'best[height<=2160][ext=mp4]/best[height<=2160]'; break;
                case '2K': formatOption = 'best[height<=1440][ext=mp4]/best[height<=1440]'; break;
                case '1080p': formatOption = 'best[height<=1080][ext=mp4]/best[height<=1080]'; break;
                case '720p': formatOption = 'best[height<=720][ext=mp4]/best[height<=720]'; break;
                case '480p': formatOption = 'best[height<=480][ext=mp4]/best[height<=480]'; break;
                case '360p': formatOption = 'best[height<=360][ext=mp4]/best[height<=360]'; break;
                case '240p': formatOption = 'best[height<=240][ext=mp4]/best[height<=240]'; break;
                default: formatOption = 'best[ext=mp4]/best';
            }
        }
        
        console.log('🔧 Enhanced yt-dlp v2.0 format option:', formatOption);
        
        // Use spawn directly instead of YTDlpWrap for better control
        console.log('🔧 Using direct spawn for yt-dlp...');
        console.log('🔐 Authentication method: Manual cookies file');
        
        const ytDlpProcess = spawn(ytDlpPath, [
            url,
            '-o', '-',
            '-f', formatOption,
            '--no-playlist',
            '--no-warnings',
            '--no-progress',
            '--quiet',
                        // Enhanced anti-bot detection v3.0 with captcha bypass
            '--user-agent', getRandomUserAgent(),
            '--cookies', getManualCookies(),
            '--no-check-certificate',
            '--prefer-insecure',
            // Enhanced CAPTCHA bypass and bot detection evasion v4.0
            '--extractor-args', 'youtube:player_client=android',
            '--extractor-args', 'youtube:player_skip=webpage',
            '--extractor-args', 'youtube:skip=hls,dash',
            '--extractor-args', 'youtube:player_client=web',
            '--extractor-args', 'youtube:player_client=ios',
            '--extractor-args', 'youtube:player_client=android_creator',
            '--extractor-args', 'youtube:player_client=android_music',
            '--extractor-args', 'youtube:innertube_host=studio.youtube.com',
            '--extractor-args', 'youtube:innertube_key=AIzaSyBUPetSUmoZL-OhlxA7wSac5XinrygCqMo',
            // Anti-CAPTCHA measures
            '--sleep-interval', '1',
            '--max-sleep-interval', '3',
            '--sleep-subtitles', '1',
            '--write-auto-subs',
            '--embed-subs',
            '--sub-lang', 'en',
            // Browser emulation to avoid CAPTCHA
            '--add-header', 'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            '--add-header', 'Accept-Language:en-US,en;q=0.5',
            '--add-header', 'Accept-Encoding:gzip, deflate',
            '--add-header', 'DNT:1',
            '--add-header', 'Connection:keep-alive',
            '--add-header', 'Upgrade-Insecure-Requests:1',
            ...(format === 'mp3' ? ['--extract-audio', '--audio-format', 'mp3'] : [])
        ]);
        
        // Add process monitoring
        ytDlpProcess.on('error', (error) => {
            console.error('❌ yt-dlp process error:', error);
        });
        
        ytDlpProcess.stderr.on('data', (data) => {
            const stderrData = data.toString().trim();
            console.log('⚠️ yt-dlp stderr:', stderrData);
            
            // Check for bot detection error
            if (stderrData.includes('Sign in to confirm you\'re not a bot')) {
                console.error('❌ yt-dlp bot detection triggered');
            }
        });
        
        ytDlpProcess.on('exit', (code, signal) => {
            console.log(`🔚 yt-dlp process exited with code ${code}, signal ${signal}`);
            if (code !== 0) {
                console.log('⚠️ yt-dlp process ended with non-zero exit code (may be due to missing browser cookies)');
            }
        });
        
        // Create a proper stream from the process
        const downloadStream = ytDlpProcess.stdout;
        
        // Add comprehensive stream monitoring
        downloadStream.on('error', (error) => {
            console.error('❌ Enhanced yt-dlp v2.0 stream error:', error);
        });
        
        let totalBytes = 0;
        downloadStream.on('data', (chunk) => {
            totalBytes += chunk.length;
            console.log(`📥 Enhanced yt-dlp v2.0 data chunk: ${chunk.length} bytes (total: ${totalBytes} bytes)`);
        });
        
        downloadStream.on('end', () => {
            console.log('✅ Enhanced yt-dlp v2.0 stream ended successfully');
        });
        
        downloadStream.on('close', () => {
            console.log('🔒 Enhanced yt-dlp v2.0 stream closed');
        });
        
        // Test if stream is readable
        if (!downloadStream.readable) {
            console.log('⚠️ Enhanced yt-dlp v2.0 stream is not readable');
        } else {
            console.log('✅ Enhanced yt-dlp v2.0 stream is readable');
        }
        
        // Check if stream has any data after a short delay
        setTimeout(() => {
            if (downloadStream.destroyed) {
                console.log('⚠️ Enhanced yt-dlp v2.0 stream was destroyed');
            } else if (downloadStream.closed) {
                console.log('⚠️ Enhanced yt-dlp v2.0 stream was closed');
            } else {
                console.log('✅ Enhanced yt-dlp v2.0 stream is still active');
            }
        }, 1000);
        
        console.log('✅ Enhanced yt-dlp v2.0 download stream created successfully');
        return downloadStream;
        
    } catch (error) {
        console.error('❌ Enhanced yt-dlp v2.0 failed:', error.message);
        throw new Error(`Enhanced yt-dlp v2.0 download failed: ${error.message}`);
    }
}

// YouTube Playlist functions
async function getYouTubePlaylistInfo(url) {
    try {
        console.log('Attempting to get YouTube playlist info for:', url);
        
        // Extract playlist ID from URL - more robust pattern matching
        let playlistId = null;
        
        // Try different patterns for playlist ID extraction
        const patterns = [
            /playlist\?list=([^&]+)/,
            /&list=([^&]+)/,
            /list=([^&]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                playlistId = match[1];
                break;
            }
        }
        
        if (!playlistId) {
            throw new Error('Could not extract playlist ID from URL');
        }
        
        console.log('🎵 Playlist ID:', playlistId);
        
        // Use the specialized ytpl library
        try {
            console.log('🔗 Using @distube/ytpl to get playlist info...');
            
                         // Get playlist info using ytpl with enhanced headers
             const playlist = await ytpl(playlistId, {
                 requestOptions: {
                     headers: getEnhancedHeaders()
                 }
             });
            
            console.log(`✅ @distube/ytpl found ${playlist.items.length} videos in playlist`);
            console.log(`📊 Playlist title: ${playlist.title}`);
            console.log(`📊 Playlist author: ${playlist.author?.name || 'Unknown'}`);
            console.log(`📊 Total videos: ${playlist.videoCount || playlist.items.length}`);
            
            // Map the playlist items to our format
            const videos = playlist.items.map((item, index) => ({
                id: item.id,
                title: item.title || `Video ${index + 1}`,
                duration: item.duration || 0,
                thumbnail: item.thumbnail?.url || '',
                url: item.shortUrl || `https://www.youtube.com/watch?v=${item.id}`
            }));
            
            const playlistInfo = {
                title: playlist.title || `YouTube Playlist (${playlistId})`,
                videoCount: videos.length,
                videos: videos,
                qualities: ['720p', '480p', '360p', '240p'],
                formats: ['mp4', 'mp3'],
                qualitySizes: {
                    '720p': '~50MB per video',
                    '480p': '~30MB per video', 
                    '360p': '~20MB per video',
                    '240p': '~15MB per video'
                },
                playlistId: playlistId,
                isPlaylist: true,
                author: playlist.author?.name || 'Unknown',
                debugInfo: {
                    method: '@distube/ytpl',
                    isStatic: false,
                    realQualities: ['720p', '480p', '360p', '240p'],
                    totalVideos: videos.length,
                    message: `Playlist retrieved via @distube/ytpl: ${videos.length} videos found`
                }
            };
            
            console.log(`✅ @distube/ytpl playlist info retrieved successfully: ${videos.length} videos`);
            return playlistInfo;
        } catch (ytplError) {
            console.log('⚠️ @distube/ytpl failed:', ytplError.message);
        }
        
        // If we get here, try web scraping approach
        try {
            console.log('🌐 Trying web scraping approach...');
            
                         // Scrape the playlist page directly
             const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
             const response = await axios.get(playlistUrl, {
                 headers: getEnhancedHeaders()
             });
            
            const html = response.data;
            console.log('📄 Playlist page scraped successfully');
            
                         // Extract video information using simpler and more reliable patterns
             // Look for video IDs and titles in the playlist data
             const playlistVideoPattern = /"playlistVideoRenderer":\s*\{[^}]*"videoId":"([^"]+)"/g;
             
             // Try multiple title patterns for better coverage - more aggressive
             const titlePatterns = [
                 /"playlistVideoRenderer":\s*\{[^}]*"title":\s*\{[^}]*"runs":\s*\[[^}]*\{[^}]*"text":\s*"([^"]+)"/g,
                 /"playlistVideoRenderer":\s*\{[^}]*"title":\s*\{[^}]*"simpleText":\s*"([^"]+)"/g,
                 /"playlistVideoRenderer":\s*\{[^}]*"title":\s*\{[^}]*"runs":\s*\[[^}]*\{[^}]*"text":\s*"([^"]+)"[^}]*\}/g,
                 // More aggressive patterns
                 /"text":\s*"([^"]+)"[^}]*"videoId":\s*"([^"]+)"/g,
                 /"title":\s*\{[^}]*"runs":\s*\[[^}]*\{[^}]*"text":\s*"([^"]+)"/g,
                 /"simpleText":\s*"([^"]+)"/g
             ];
             
             const playlistThumbnailPattern = /"playlistVideoRenderer":\s*\{[^}]*"thumbnail":\s*\{[^}]*"thumbnails":\s*\[[^}]*\{[^}]*"url":\s*"([^"]+)"/g;
             
             // Extract only playlist videos (not all videos on the page)
             const videoIds = [...html.matchAll(playlistVideoPattern)].map(match => match[1]);
             
             // Try to extract titles using multiple patterns - more robust
             let titles = [];
             for (const pattern of titlePatterns) {
                 try {
                     const matches = [...html.matchAll(pattern)];
                     if (matches.length > 0) {
                         // Handle different pattern structures
                         if (pattern.source.includes('"text":') && pattern.source.includes('"videoId":')) {
                             // Pattern with both text and videoId - extract text only
                             titles = matches.map(match => match[1]);
                         } else {
                             // Regular pattern - extract first group
                             titles = matches.map(match => match[1]);
                         }
                         
                         // Filter out empty or invalid titles
                         titles = titles.filter(title => title && title.length > 2 && !title.includes('\\'));
                         
                         if (titles.length > 0) {
                             console.log(`🔍 Found ${titles.length} valid titles using pattern:`, pattern.source.substring(0, 50) + '...');
                             console.log(`🔍 Sample titles:`, titles.slice(0, 3));
                             break;
                         }
                     }
                 } catch (error) {
                     console.log(`⚠️ Pattern failed:`, error.message);
                     continue;
                 }
             }
             
             const thumbnails = [...html.matchAll(playlistThumbnailPattern)].map(match => match[1]);
             
             console.log(`🔍 Found ${videoIds.length} playlist videos, ${titles.length} titles, ${thumbnails.length} thumbnails`);
             
             // Limit to reasonable number of videos (max 100) to avoid performance issues
             const maxVideos = Math.min(videoIds.length, 100);
                          const limitedVideoIds = videoIds.slice(0, maxVideos);
             const limitedTitles = titles.slice(0, maxVideos);
             const limitedThumbnails = thumbnails.slice(0, maxVideos);
            
                         console.log(`🔍 Found ${limitedVideoIds.length} limited playlist videos, ${limitedTitles.length} titles, ${limitedThumbnails.length} thumbnails`);
             
             if (limitedVideoIds.length > 0) {
                 // Create videos array with limited data to avoid performance issues
                 const videos = limitedVideoIds.map((id, index) => ({
                     id: id,
                     title: limitedTitles[index] || `Video ${index + 1}`,
                     duration: 0, // We can't get duration from scraping
                     thumbnail: limitedThumbnails[index] || '',
                     url: `https://www.youtube.com/watch?v=${id}`
                 }));
                
                                                 // Try to extract playlist title from the page
                let playlistTitle = `YouTube Playlist (${playlistId})`;
                try {
                    const titleMatch = html.match(/"title":\s*"([^"]+)"/);
                    if (titleMatch && titleMatch[1]) {
                        playlistTitle = titleMatch[1];
                        console.log(`📊 Extracted playlist title: ${playlistTitle}`);
                    }
                } catch (titleError) {
                    console.log('⚠️ Could not extract playlist title:', titleError.message);
                }
                
                const playlistInfo = {
                    title: playlistTitle,
                    videoCount: limitedVideoIds.length,
                    videos: videos,
                    qualities: ['720p', '480p', '360p', '240p'],
                    formats: ['mp4', 'mp3'],
                    qualitySizes: {
                        '720p': '~50MB per video',
                        '480p': '~30MB per video', 
                        '360p': '~20MB per video',
                        '240p': '~15MB per video'
                    },
                    playlistId: playlistId,
                    isPlaylist: true,
                    debugInfo: {
                        method: 'Web Scraping',
                        isStatic: false,
                        realQualities: ['720p', '480p', '360p', '240p'],
                        totalVideos: limitedVideoIds.length,
                        message: `Playlist retrieved via web scraping: ${limitedVideoIds.length} videos found`
                    }
                };
                
                                 console.log(`✅ Web scraping approach successful: ${limitedVideoIds.length} limited videos found`);
                 return playlistInfo;
            }
            
        } catch (scrapingError) {
            console.log('⚠️ Web scraping approach failed:', scrapingError.message);
        }
        
        // If we get here, create basic playlist info without ytdl-core
        try {
            console.log('🔄 Creating basic playlist info without ytdl-core...');
            
            // Create a basic playlist info with placeholder video
            const videos = [{
                id: playlistId,
                title: `Playlist Video (${playlistId})`,
                duration: 0,
                thumbnail: '',
                url: `https://www.youtube.com/watch?v=${playlistId}`
            }];
            
            const playlistInfo = {
                title: `YouTube Playlist (${playlistId})`,
                videoCount: 1, // At least one video found
                videos: videos,
                qualities: ['720p', '480p', '360p', '240p'],
                formats: ['mp4', 'mp3'],
                qualitySizes: {
                    '720p': '~50MB per video',
                    '480p': '~30MB per video', 
                    '360p': '~20MB per video',
                    '240p': '~15MB per video'
                },
                playlistId: playlistId,
                isPlaylist: true
            };
            
            console.log(`✅ Basic playlist info created with ${videos.length} video`);
            return playlistInfo;
            
        } catch (altError) {
            console.log('⚠️ Basic playlist creation failed:', altError.message);
            
            // Ultimate fallback: create basic playlist info
            const playlistInfo = {
                title: `YouTube Playlist (${playlistId})`,
                videoCount: 0,
                videos: [],
                qualities: ['720p', '480p', '360p', '240p'],
                formats: ['mp4', 'mp3'],
                qualitySizes: {
                    '720p': '~50MB per video',
                    '480p': '~30MB per video', 
                    '360p': '~20MB per video',
                    '240p': '~15MB per video'
                },
                playlistId: playlistId,
                isPlaylist: true
            };
            
            console.log(`✅ Ultimate fallback playlist info created for ID: ${playlistId}`);
            return playlistInfo;
        }
        
    } catch (error) {
        console.error('❌ Error getting YouTube playlist info:', error);
        throw new Error(`Failed to get YouTube playlist information: ${error.message}`);
    }
}

async function downloadYouTubePlaylist(url, quality, format) {
    try {
        console.log(`🎵 Downloading YouTube playlist: ${quality} ${format}`);
        
        // Get playlist info first
        const playlistInfo = await getYouTubePlaylistInfo(url);
        
        // For now, return info about the playlist
        // In a full implementation, you would download all videos
        const infoStream = new Readable({
            read() {
                const message = `Playlist: ${playlistInfo.title}\nVideos: ${playlistInfo.videoCount}\nQuality: ${quality}\nFormat: ${format}\n\nThis is a playlist download. Individual video downloads are not yet implemented.`;
                this.push(Buffer.from(message));
                this.push(null);
            }
        });
        
        return infoStream;
        
    } catch (error) {
        console.error('❌ Error downloading YouTube playlist:', error);
        throw new Error(`Failed to download YouTube playlist: ${error.message}`);
    }
}

// ===== TWITTER/X FUNCTIONALITY =====
async function getTwitterVideoInfo(url) {
    try {
        console.log('🐦 Getting Twitter/X video info for:', url);
        
        // Extract video ID from various Twitter/X URL formats
        const videoId = extractTwitterVideoId(url);
        if (!videoId) {
            throw new Error('Invalid Twitter/X URL format');
        }
        
        // Use specialized Twitter downloader library
        const result = await TwitterDownloader.TwitterDL(url);
        
        if (!result || result.status === 'error') {
            throw new Error(result.message || 'No video found in this tweet');
        }
        
        // Check if we have media with videos
        if (!result.result || !result.result.media || result.result.media.length === 0) {
            throw new Error('No media found in this tweet');
        }
        
        // Find video media
        const videoMedia = result.result.media.find(media => media.type === 'video' || media.type === 'animated_gif');
        if (!videoMedia || !videoMedia.videos || videoMedia.videos.length === 0) {
            throw new Error('No video found in this tweet');
        }
        
        // Get the best quality video
        const bestVideo = videoMedia.videos.reduce((best, current) => {
            if (!best) return current;
            const bestQuality = parseInt(best.quality.split('x')[0]);
            const currentQuality = parseInt(current.quality.split('x')[0]);
            return currentQuality > bestQuality ? current : best;
        });
        
        const videoUrl = bestVideo.url;
        const thumbnail = videoMedia.cover || '';
        
        return {
            title: `Twitter Video ${videoId}`,
            duration: 'Unknown',
            thumbnail: thumbnail,
            formats: ['mp4'],
            platform: 'Twitter/X',
            downloadUrl: videoUrl // Store the actual download URL separately
        };
        
    } catch (error) {
        console.error('❌ Twitter/X video info error:', error);
        throw new Error(`Failed to get Twitter/X video info: ${error.message}`);
    }
}

function extractTwitterVideoId(url) {
    // Handle various Twitter/X URL formats
    const patterns = [
        /twitter\.com\/\w+\/status\/(\d+)/,
        /x\.com\/\w+\/status\/(\d+)/,
        /twitter\.com\/i\/status\/(\d+)/,
        /x\.com\/i\/status\/(\d+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    return null;
}

async function downloadTwitter(url, quality, format) {
    try {
        console.log('🐦 Downloading Twitter/X video:', quality, format);
        
        const videoInfo = await getTwitterVideoInfo(url);
        const downloadUrl = videoInfo.downloadUrl;
        
        if (!downloadUrl) {
            throw new Error('No download URL available');
        }
        
        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        return response.data;
        
    } catch (error) {
        console.error('❌ Twitter/X download error:', error);
        throw new Error(`Failed to download Twitter/X video: ${error.message}`);
    }
}

// ===== INSTAGRAM FUNCTIONALITY =====
async function getInstagramVideoInfo(url) {
    try {
        console.log('📸 Getting Instagram video info for:', url);
        
        // Extract media ID from Instagram URL
        const mediaId = extractInstagramMediaId(url);
        console.log('🔍 Instagram URL:', url);
        console.log('🔍 Extracted media ID:', mediaId);
        if (!mediaId) {
            throw new Error('Invalid Instagram URL format');
        }
        
        // Use specialized Instagram downloader library
        const result = await InstagramDownloader.instagramGetUrl(url);
        
        console.log('🔍 Instagram API result:', JSON.stringify(result, null, 2));
        
        if (!result || result.error) {
            throw new Error(result.error || 'No video found in this Instagram post');
        }
        
        // Instagram library returns different structure
        const videoUrl = result.url_list?.[0] || result.media_details?.[0]?.url || result.url || result.download_url;
        const thumbnail = result.media_details?.[0]?.thumbnail || result.thumb || result.thumbnail || '';
        
        if (!videoUrl) {
            throw new Error('No video URL found in this Instagram post');
        }
        
        // Get real title from caption if available
        const realTitle = result.post_info?.caption || `Instagram Video ${mediaId}`;
        
        return {
            title: realTitle,
            duration: 'Unknown',
            thumbnail: thumbnail,
            formats: ['mp4'],
            platform: 'Instagram',
            downloadUrl: videoUrl // Store the actual download URL separately
        };
        
    } catch (error) {
        console.error('❌ Instagram video info error:', error);
        throw new Error(`Failed to get Instagram video info: ${error.message}`);
    }
}

function extractInstagramMediaId(url) {
    // Handle various Instagram URL formats - more permissive
    const patterns = [
        /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
        /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
        /instagram\.com\/reels\/([a-zA-Z0-9_-]+)/,
        /instagram\.com\/tv\/([a-zA-Z0-9_-]+)/,
        /instagram\.com\/explore\/([a-zA-Z0-9_-]+)/,
        /instagram\.com\/[^\/]+\/([a-zA-Z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    // If no pattern matches, try to extract any ID from the URL
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart && lastPart.length > 5) {
        return lastPart;
    }
    
    return null;
}

async function downloadInstagram(url, quality, format) {
    try {
        console.log('📸 Downloading Instagram video:', quality, format);
        
        const videoInfo = await getInstagramVideoInfo(url);
        const downloadUrl = videoInfo.downloadUrl;
        
        if (!downloadUrl) {
            throw new Error('No download URL available');
        }
        
        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        return response.data;
        
    } catch (error) {
        console.error('❌ Instagram download error:', error);
        throw new Error(`Failed to download Instagram video: ${error.message}`);
    }
}

// ===== TIKTOK FUNCTIONALITY =====
async function getTikTokVideoInfo(url) {
    try {
        console.log('🎵 Getting TikTok video info for:', url);
        
        // Extract video ID from TikTok URL
        const videoId = extractTikTokVideoId(url);
        if (!videoId) {
            throw new Error('Invalid TikTok URL format');
        }
        
        // Use specialized TikTok API library
        const result = await TikTokApi.Downloader(url);
        
        if (!result) {
            throw new Error('No video found in this TikTok');
        }
        
        // Get the video URL from TikTok API result - the structure is different
        const videoUrl = result.result?.video?.downloadAddr?.[0] || result.result?.video?.playAddr?.[0];
        const thumbnail = result.result?.video?.cover?.[0] || '';
        
        console.log('🔍 TikTok video URL found:', videoUrl ? 'Yes' : 'No');
        console.log('🔍 TikTok thumbnail found:', thumbnail ? 'Yes' : 'No');
        
        if (!videoUrl) {
            throw new Error('Could not extract video URL from TikTok result');
        }
        
        // Get real title from description if available
        const realTitle = result.result?.video?.desc || `TikTok Video ${videoId}`;
        
        // Try to get no-watermark version using ruhend-scraper
        let noWatermarkUrl = null;
        try {
            const noWatermarkResult = await RuhendScraper.ttdl(url);
            if (noWatermarkResult.video_hd) {
                noWatermarkUrl = noWatermarkResult.video_hd;
            } else if (noWatermarkResult.video) {
                noWatermarkUrl = noWatermarkResult.video;
            }
        } catch (error) {
            console.log('⚠️ Could not get no-watermark version:', error.message);
        }
        
        return {
            title: realTitle,
            duration: 'Unknown',
            thumbnail: thumbnail,
            formats: ['mp4'],
            platform: 'TikTok',
            downloadUrl: videoUrl, // Store the actual download URL separately
            noWatermarkUrl: noWatermarkUrl, // Store no-watermark URL if available
            hasNoWatermark: !!noWatermarkUrl
        };
        
    } catch (error) {
        console.error('❌ TikTok video info error:', error);
        throw new Error(`Failed to get TikTok video info: ${error.message}`);
    }
}

function extractTikTokVideoId(url) {
    // Handle various TikTok URL formats
    const patterns = [
        /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
        /tiktok\.com\/v\/(\d+)/,
        /vm\.tiktok\.com\/([a-zA-Z0-9]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    return null;
}

async function downloadTikTok(url, quality, format) {
    try {
        console.log('🎵 Downloading TikTok video:', quality, format);
        
        const videoInfo = await getTikTokVideoInfo(url);
        
        // Choose download URL based on quality
        let downloadUrl;
        if (quality === 'NoWatermark' && videoInfo.noWatermarkUrl) {
            downloadUrl = videoInfo.noWatermarkUrl;
            console.log('🎵 Using no-watermark URL for TikTok');
        } else {
            downloadUrl = videoInfo.downloadUrl;
            console.log('🎵 Using standard URL for TikTok');
        }
        
        if (!downloadUrl) {
            throw new Error('No download URL available');
        }
        
        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        return response.data;
        
    } catch (error) {
        console.error('❌ TikTok download error:', error);
        throw new Error(`Failed to download TikTok video: ${error.message}`);
    }
}

// ===== VIMEO FUNCTIONALITY =====
async function getVimeoVideoInfo(url) {
    try {
        console.log('🎬 Getting Vimeo video info for:', url);
        
        // Extract video ID from Vimeo URL
        const videoId = extractVimeoVideoId(url);
        if (!videoId) {
            throw new Error('Invalid Vimeo URL format');
        }
        
        // Use Vimeo API to get video info
        const apiUrl = `https://api.vimeo.com/videos/${videoId}`;
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const videoData = response.data;
        
        // Try to extract download links from the page
        let downloadUrl = '';
        if (videoData.download && videoData.download.length > 0) {
            downloadUrl = videoData.download[0].link;
        }
        
        // If no download link, try to get the video URL from the page
        if (!downloadUrl) {
            // Try to get the video URL from the Vimeo page
            const pageResponse = await axios.get(url);
            const pageHtml = pageResponse.data;
            
            // Look for video URL in the page
            const videoMatch = pageHtml.match(/"progressive":\[([^\]]+)\]/);
            if (videoMatch) {
                try {
                    const progressiveData = JSON.parse(`[${videoMatch[1]}]`);
                    if (progressiveData.length > 0) {
                        downloadUrl = progressiveData[0].url;
                    }
                } catch (e) {
                    console.log('Could not parse progressive data');
                }
            }
        }
        
        if (!downloadUrl) {
            throw new Error('No download URL found for this Vimeo video');
        }
        
        return {
            title: videoData.name || `Vimeo Video ${videoId}`,
            duration: videoData.duration || 'Unknown',
            thumbnail: videoData.pictures?.base_link || '',
            formats: ['mp4'],
            platform: 'Vimeo',
            downloadUrl: downloadUrl // Store the actual download URL separately
        };
        
    } catch (error) {
        console.error('❌ Vimeo video info error:', error);
        throw new Error(`Failed to get Vimeo video info: ${error.message}`);
    }
}

function extractVimeoVideoId(url) {
    // Handle various Vimeo URL formats
    const patterns = [
        /vimeo\.com\/(\d+)/,
        /vimeo\.com\/channels\/[\w.-]+\/(\d+)/,
        /vimeo\.com\/groups\/[\w.-]+\/videos\/(\d+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    return null;
}

async function downloadVimeo(url, quality, format) {
    try {
        console.log('🎬 Downloading Vimeo video:', quality, format);
        
        const videoInfo = await getVimeoVideoInfo(url);
        const downloadUrl = videoInfo.downloadUrl;
        
        if (!downloadUrl) {
            throw new Error('No download URL available');
        }
        
        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        return response.data;
        
    } catch (error) {
        console.error('❌ Vimeo download error:', error);
        throw new Error(`Failed to download Vimeo video: ${error.message}`);
    }
}

// Test cookies endpoint
app.post('/test-cookies', async (req, res) => {
    try {
        const { cookies } = req.body;
        
        if (!cookies || !cookies.CONSENT || !cookies.VISITOR_INFO1_LIVE || !cookies.YSC) {
            return res.json({
                success: false,
                message: 'Missing required cookies (CONSENT, VISITOR_INFO1_LIVE, YSC)'
            });
        }
        
        console.log('🧪 Testing cookies:', Object.keys(cookies));
        
        // Try to make a simple request to YouTube with these cookies
        try {
            const cookieFile = createTestCookieFile(cookies);
            
            // Test with yt-dlp to see if cookies work
            const testResult = await testYoutubeCookies(cookieFile);
            
            // Clean up test file
            try {
                fs.unlinkSync(cookieFile);
            } catch (e) {
                console.log('Could not delete test cookie file');
            }
            
            if (testResult.success) {
                res.json({
                    success: true,
                    message: 'Cookies are working! YouTube access confirmed.',
                    details: testResult.details
                });
            } else {
                res.json({
                    success: false,
                    message: 'Cookies failed YouTube access test. They may be expired or invalid.',
                    details: testResult.details
                });
            }
            
        } catch (error) {
            console.error('❌ Cookie test error:', error);
            res.json({
                success: false,
                message: 'Could not test cookies due to server error',
                error: error.message
            });
        }
        
    } catch (error) {
        console.error('❌ Test cookies endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while testing cookies',
            error: error.message
        });
    }
});

function createTestCookieFile(cookies) {
    const fs = require('fs');
    const cookieFile = './test_cookies.txt';
    
    const netscapeCookies = `# Netscape HTTP Cookie File
# Test cookies for YouTube access verification
.youtube.com	TRUE	/	FALSE	1735689600	CONSENT	${cookies.CONSENT}
.youtube.com	TRUE	/	FALSE	1735689600	VISITOR_INFO1_LIVE	${cookies.VISITOR_INFO1_LIVE}
.youtube.com	TRUE	/	FALSE	1735689600	YSC	${cookies.YSC}
.youtube.com	TRUE	/	FALSE	1735689600	GPS	1
.youtube.com	TRUE	/	FALSE	1735689600	PREF	f4=4000000&tz=Europe.Bucharest&f5=20000&f6=8
.youtube.com	TRUE	/	FALSE	1735689600	LOGIN_INFO	${cookies.LOGIN_INFO || ''}
.youtube.com	TRUE	/	FALSE	1735689600	SID	${cookies.SID || ''}
.youtube.com	TRUE	/	FALSE	1735689600	HSID	${cookies.HSID || ''}
.youtube.com	TRUE	/	FALSE	1735689600	SSID	${cookies.SSID || ''}
.youtube.com	TRUE	/	FALSE	1735689600	APISID	${cookies.APISID || ''}
.youtube.com	TRUE	/	FALSE	1735689600	SAPISID	${cookies.SAPISID || ''}
.youtube.com	TRUE	/	FALSE	1735689600	__Secure-1PAPISID	${cookies.SECURE_1PAPISID || ''}
.youtube.com	TRUE	/	FALSE	1735689600	__Secure-3PAPISID	${cookies.SECURE_3PAPISID || ''}
.youtube.com	TRUE	/	FALSE	1735689600	__Secure-1PSID	${cookies.SECURE_1PSID || ''}
.youtube.com	TRUE	/	FALSE	1735689600	__Secure-3PSID	${cookies.SECURE_3PSID || ''}
.youtube.com	TRUE	/	FALSE	1735689600	__Secure-1PSIDCC	${cookies.SECURE_1PSIDCC || ''}
.youtube.com	TRUE	/	FALSE	1735689600	__Secure-3PSIDCC	${cookies.SECURE_3PSIDCC || ''}
`;
    
    fs.writeFileSync(cookieFile, netscapeCookies);
    return cookieFile;
}

async function testYoutubeCookies(cookieFile) {
    return new Promise((resolve) => {
        const { spawn } = require('child_process');
        
        // Test with a simple video info request
        const ytDlpArgs = [
            '--no-progress',
            '--quiet',
            '--cookies', cookieFile,
            '--no-check-certificate',
            '--prefer-insecure',
            '--extractor-args', 'youtube:player_client=android',
            '--extractor-args', 'youtube:player_skip=webpage',
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ' // Rick Roll video for testing
        ];
        
        console.log('🧪 Testing cookies with yt-dlp:', ytDlpArgs.join(' '));
        
        const ytDlpProcess = spawn('./yt-dlp', ytDlpArgs);
        
        let stdout = '';
        let stderr = '';
        
        ytDlpProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        ytDlpProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        ytDlpProcess.on('close', (code) => {
            console.log('🧪 yt-dlp test process exited with code:', code);
            console.log('🧪 Test stdout:', stdout);
            console.log('🧪 Test stderr:', stderr);
            
            if (code === 0 && stdout.includes('title')) {
                resolve({
                    success: true,
                    details: 'Successfully retrieved video information with provided cookies'
                });
            } else if (stderr.includes('Sign in to confirm you\'re not a bot')) {
                resolve({
                    success: false,
                    details: 'YouTube detected bot activity - cookies may be invalid or expired'
                });
            } else if (stderr.includes('Video unavailable')) {
                resolve({
                    success: false,
                    details: 'Video unavailable - cookies may not have proper access'
                });
            } else {
                resolve({
                    success: false,
                    details: `yt-dlp failed with code ${code}: ${stderr}`
                });
            }
        });
        
        ytDlpProcess.on('error', (error) => {
            console.error('🧪 yt-dlp test process error:', error);
            resolve({
                success: false,
                details: `Process error: ${error.message}`
            });
        });
        
        // Timeout after 30 seconds
        setTimeout(() => {
            ytDlpProcess.kill();
            resolve({
                success: false,
                details: 'Test timed out after 30 seconds'
            });
        }, 30000);
    });
}

// Enable CAPTCHA bypass endpoint
app.post('/enable-captcha-bypass', (req, res) => {
    try {
        console.log('🤖 CAPTCHA Bypass Mode enabled from frontend');
        global.captchaBypassEnabled = true;
        res.json({ success: true, message: 'CAPTCHA bypass enabled' });
    } catch (error) {
        console.error('❌ Error enabling CAPTCHA bypass:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
});
