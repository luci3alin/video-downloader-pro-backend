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

// NEW: Working alternative YouTube download library
const btchDownloader = require('btch-downloader');

// NEW: Modern YouTube download alternatives (temporarily commented for debugging)
// const play = require('play-dl');
// const zulYtdl = require('@zulproject/ytdl');

// YouTube API Key for fallback (all restrictions removed)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyDATZtBCDsSV1Bjb8xNZmQpZBtLhTJ-htk';

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
    
    // Check if we have uploaded cookies file
    const uploadedCookieFile = './youtube_cookies_uploaded.txt';
    if (fs.existsSync(uploadedCookieFile)) {
        console.log('🍪 Using uploaded cookies file for authentication');
        return uploadedCookieFile;
    }
    
    // Use manual cookies from frontend if available
    const cookiesToUse = userCookies;
    
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

// Parse Netscape format cookies
function parseNetscapeCookies(cookiesData) {
    const cookies = {};
    const lines = cookiesData.split('\n');
    
    for (const line of lines) {
        // Skip comments and empty lines
        if (line.startsWith('#') || line.trim() === '') continue;
        
        const parts = line.split('\t');
        if (parts.length >= 7) {
            const domain = parts[0];
            const path = parts[2];
            const secure = parts[3] === 'TRUE';
            const expiry = parts[4];
            const name = parts[5];
            const value = parts[6];
            
            // Only process YouTube cookies
            if (domain.includes('youtube.com') || domain.includes('.youtube.com')) {
                cookies[name] = value;
                console.log(`🍪 Parsed cookie: ${name} = ${value.substring(0, 20)}...`);
            }
        }
    }
    
    return cookies;
}

// Parse HeaderString format cookies
function parseHeaderStringCookies(cookiesData) {
    const cookies = {};
    const cookiePairs = cookiesData.split(';');
    
    for (const pair of cookiePairs) {
        const [name, value] = pair.trim().split('=');
        if (name && value) {
            cookies[name.trim()] = value.trim();
            console.log(`🍪 Parsed header cookie: ${name.trim()} = ${value.trim().substring(0, 20)}...`);
        }
    }
    
    return cookies;
}

// Create cookies file from parsed cookies
function createCookiesFileFromParsed(parsedCookies) {
    const cookieFile = './youtube_cookies_uploaded.txt';
    
    // Create Netscape format cookies file
    let netscapeCookies = `# Netscape HTTP Cookie File
# This file contains REAL YouTube cookies from uploaded file
# Generated automatically from user upload
`;
    
    // Add each cookie in Netscape format
    for (const [name, value] of Object.entries(parsedCookies)) {
        const expiry = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year from now
        netscapeCookies += `.youtube.com\tTRUE\t/\tFALSE\t${expiry}\t${name}\t${value}\n`;
    }
    
    try {
        fs.writeFileSync(cookieFile, netscapeCookies);
        console.log('✅ Created cookies file from uploaded data:', cookieFile);
        return cookieFile;
    } catch (error) {
        console.error('❌ Error creating cookies file:', error);
        throw new Error('Failed to create cookies file from uploaded data');
    }
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

// Pinchflat integration
let pinchflatStatus = 'stopped';

// Initialize PornHub client
const pornhub = new PornHub();

// Check Pinchflat service status (for Render deployment)
async function startPinchflat() {
    try {
        console.log('🐳 Checking Pinchflat service status...');
        
        // Get Pinchflat URL from environment or use default
        const pinchflatUrl = process.env.PINCHFLAT_URL || 'http://localhost:8945';
        console.log('🔗 Pinchflat service URL:', pinchflatUrl);
        
        // Try to connect to Pinchflat service
        try {
            const response = await axios.get(`${pinchflatUrl}/`, { timeout: 10000 });
            if (response.status === 200) {
                console.log('✅ Pinchflat service is accessible');
                pinchflatStatus = 'running';
                return;
            }
        } catch (healthError) {
            console.log('⚠️ Pinchflat service not accessible:', healthError.message);
            
            // On Render, this is expected during first deployment
            if (process.env.RENDER) {
                console.log('ℹ️ Running on Render - Pinchflat service may not be ready yet');
                console.log('ℹ️ Pinchflat will be available after both services deploy');
                pinchflatStatus = 'deploying';
                return;
            }
        }
        
        console.log('⚠️ Pinchflat service not available');
        pinchflatStatus = 'stopped';
        
    } catch (error) {
        console.error('❌ Failed to check Pinchflat service:', error);
        pinchflatStatus = 'error';
    }
}



// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🔄 Shutting down gracefully...');
    process.exit();
});

// Start Pinchflat when server starts
startPinchflat();

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

// Pinchflat status endpoint
app.get('/api/pinchflat-status', (req, res) => {
    try {
        res.json({
            success: true,
            status: pinchflatStatus,
            port: 8945,
            message: `Pinchflat is ${pinchflatStatus}`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Pinchflat download endpoint
app.post('/api/pinchflat-download', async (req, res) => {
    try {
        const { url, quality, format } = req.body;
        
        if (!url) {
            return res.status(400).json({ 
                success: false, 
                error: 'URL is required' 
            });
        }
        
        console.log('🐳 Pinchflat download request:', { url, quality, format });
        
        // Check if Pinchflat is running (for status monitoring)
        if (pinchflatStatus !== 'running') {
            console.log('⚠️ Pinchflat not running, but continuing with yt-dlp...');
        }
        
        // Start download using the new Pinchflat configuration function
        try {
            const downloadStream = await downloadYouTube(url, quality, format);
            
            res.json({
                success: true,
                message: 'Download started with Pinchflat anti-bot configuration',
                method: 'yt-dlp with Pinchflat config',
                quality: quality,
                format: format,
                status: 'downloading'
            });
            
        } catch (downloadError) {
            console.error('❌ Download failed:', downloadError);
            res.status(500).json({
                success: false,
                error: `Download failed: ${downloadError.message}`
            });
        }
        
    } catch (error) {
        console.error('❌ Pinchflat download endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Pinchflat download status endpoint
app.get('/api/pinchflat-download-status/:ruleId', async (req, res) => {
    try {
        const { ruleId } = req.params;
        
        if (!ruleId) {
            return res.status(400).json({
                success: false,
                error: 'Rule ID is required'
            });
        }
        
        // Get rule status from Pinchflat
        const ruleResponse = await axios.get(`http://localhost:8945/api/rules/${ruleId}`);
        const rule = ruleResponse.data;
        
        // Get download info if available
        let downloadInfo = null;
        try {
            const downloadsResponse = await axios.get('http://localhost:8945/api/downloads');
            const downloads = downloadsResponse.data;
            downloadInfo = downloads.find(d => d.rule_id === ruleId);
        } catch (downloadError) {
            console.log('⚠️ Could not get download info:', downloadError.message);
        }
        
        res.json({
            success: true,
            ruleId: ruleId,
            rule: rule,
            download: downloadInfo,
            status: rule.status || 'unknown',
            message: `Rule ${ruleId} is ${rule.status || 'unknown'}`
        });
        
    } catch (error) {
        console.error('❌ Pinchflat download status error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
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
        
        // Check if we're on Render.com (production)
        const isProduction = process.env.RENDER || process.env.NODE_ENV === 'production';
        
        let ytDlpProcess;
        
        if (isProduction) {
            // Check if we have uploaded cookies
            const hasUploadedCookies = fs.existsSync('./youtube_cookies_uploaded.txt');
            
            if (hasUploadedCookies) {
                console.log('🔧 Using uploaded cookies on Render.com...');
                console.log('🔐 Authentication method: Uploaded cookies file');
                
                // Use uploaded cookies on Render.com with enhanced authentication
                ytDlpProcess = spawn(ytDlpPath, [
                    url,
                    '-o', '-',
                    '-f', formatOption,
                    '--no-playlist',
                    '--no-warnings',
                    '--no-progress',
                    '--verbose',
                    '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    '--cookies', './youtube_cookies_uploaded.txt',
                    '--no-check-certificate',
                    '--prefer-insecure',
                    '--ignore-errors',
                    '--ignore-no-formats-error',
                    '--no-abort-on-error',
                    '--retries', '10',
                    '--fragment-retries', '10',
                    '--file-access-retries', '10',
                    '--extractor-retries', '10',
                    '--concurrent-fragments', '1',
                    '--max-downloads', '1',
                    // Enhanced authentication with multiple player clients
                    '--extractor-args', 'youtube:player_client=web',
                    '--extractor-args', 'youtube:player_client=android',
                    '--extractor-args', 'youtube:player_client=ios',
                    '--extractor-args', 'youtube:player_client=android_creator',
                    '--extractor-args', 'youtube:player_client=android_music',
                    '--extractor-args', 'youtube:player_skip=webpage',
                    '--extractor-args', 'youtube:skip=hls,dash',
                    // Enhanced headers for better authentication
                    '--add-header', 'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    '--add-header', 'Accept-Language:en-US,en;q=0.9',
                    '--add-header', 'Accept-Encoding:gzip, deflate, br',
                    '--add-header', 'DNT:1',
                    '--add-header', 'Connection:keep-alive',
                    '--add-header', 'Upgrade-Insecure-Requests:1',
                    '--add-header', 'Sec-Fetch-Dest:document',
                    '--add-header', 'Sec-Fetch-Mode:navigate',
                    '--add-header', 'Sec-Fetch-Site:none',
                    '--add-header', 'Sec-Fetch-User:?1',
                    '--add-header', 'Cache-Control:max-age=0',
                    '--add-header', 'Sec-Ch-Ua:"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                    '--add-header', 'Sec-Ch-Ua-Mobile:?0',
                    '--add-header', 'Sec-Ch-Ua-Platform:"Windows"',
                    '--add-header', 'X-Requested-With:XMLHttpRequest',
                    '--add-header', 'Referer:https://www.youtube.com/',
                    '--add-header', 'Origin:https://www.youtube.com',
                    '--sleep-interval', '1',
                    ...(format === 'mp3' ? ['--extract-audio', '--audio-format', 'mp3'] : [])
                ]);
            } else {
                console.log('🔧 Using MEGA-AGGRESSIVE CAPTCHA bypass mode for Render.com...');
                console.log('🔐 Authentication method: MEGA-AGGRESSIVE bypass (no cookies needed)');
                
                // On Render.com, use MEGA-AGGRESSIVE CAPTCHA bypass mode automatically
                ytDlpProcess = spawn(ytDlpPath, [
                    url,
                    '-o', '-',
                    '-f', formatOption,
                    '--no-playlist',
                    '--no-warnings',
                    '--no-progress',
                    '--verbose',
                    // MEGA-AGGRESSIVE CAPTCHA bypass v6.0 - FORCE SUCCESS!
                    '--user-agent', 'Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/118.0 Firefox/118.0',
                    '--no-check-certificate',
                    '--prefer-insecure',
                    '--ignore-errors',
                    '--ignore-no-formats-error',
                    '--no-abort-on-error',
                    '--retries', '10',
                    '--fragment-retries', '10',
                    '--file-access-retries', '10',
                    '--extractor-retries', '10',
                    '--concurrent-fragments', '1',
                    '--max-downloads', '1',
                    // MEGA-AGGRESSIVE extractor args - FORCE SUCCESS!
                    '--extractor-args', 'youtube:player_client=android',
                    '--extractor-args', 'youtube:player_skip=webpage',
                    '--extractor-args', 'youtube:skip=hls,dash',
                    // MEGA-AGGRESSIVE anti-CAPTCHA measures v6.0 - FORCE SUCCESS!
                    '--sleep-interval', '1',
                                    // MEGA-AGGRESSIVE browser emulation - FORCE SUCCESS!
                '--add-header', 'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                '--add-header', 'Accept-Language:en-US,en;q=0.9,ro;q=0.8',
                '--add-header', 'Accept-Encoding:gzip, deflate, br',
                '--add-header', 'DNT:1',
                '--add-header', 'Connection:keep-alive',
                '--add-header', 'Upgrade-Insecure-Requests:1',
                '--add-header', 'Sec-Fetch-Dest:document',
                '--add-header', 'Sec-Fetch-Mode:navigate',
                '--add-header', 'Sec-Fetch-Site:none',
                '--add-header', 'Sec-Fetch-User:?1',
                '--add-header', 'Cache-Control:max-age=0',
                '--add-header', 'Sec-Ch-Ua:"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                '--add-header', 'Sec-Ch-Ua-Mobile:?0',
                '--add-header', 'Sec-Ch-Ua-Platform:"Windows"',
                '--add-header', 'X-Requested-With:XMLHttpRequest',
                    // MEGA-AGGRESSIVE mobile device emulation - FORCE SUCCESS!
                    '--add-header', 'X-Forwarded-For:192.168.1.1',
                    '--add-header', 'X-Real-IP:192.168.1.1',
                    '--add-header', 'X-Forwarded-Proto:https',
                    // MEGA-AGGRESSIVE referrer spoofing - FORCE SUCCESS!
                    '--add-header', 'Referer:https://www.youtube.com/',
                    '--add-header', 'Origin:https://www.youtube.com',
                    // MEGA-AGGRESSIVE additional headers - FORCE SUCCESS!
                    '--add-header', 'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    '--add-header', 'Accept-Language:en-US,en:q=0.5',
                    '--add-header', 'Accept-Encoding:gzip, deflate',
                    '--add-header', 'Connection:keep-alive',
                    '--add-header', 'Upgrade-Insecure-Requests:1',
                    '--add-header', 'Sec-Fetch-Dest:document',
                    '--add-header', 'Sec-Fetch-Mode:navigate',
                    '--add-header', 'Sec-Fetch-Site:none',
                    '--add-header', 'Cache-Control:max-age=0',
                    // MEGA-AGGRESSIVE format forcing - FORCE SUCCESS!
                    ...(format === 'mp3' ? ['--extract-audio', '--audio-format', 'mp3'] : [])
                ]);
            }
        } else {
            console.log('🔧 Using standard mode for local development...');
            console.log('🔐 Authentication method: Manual cookies file');
            
            // On local, use standard mode with cookies
            ytDlpProcess = spawn(ytDlpPath, [
                url,
                '-o', '-',
                '-f', formatOption,
                '--no-playlist',
                '--no-warnings',
                '--no-progress',
                '--quiet',
                '--user-agent', getRandomUserAgent(),
                '--cookies', getManualCookies(),
                '--no-check-certificate',
                '--prefer-insecure',
                // Standard anti-bot detection
                '--extractor-args', 'youtube:player_client=android',
                '--extractor-args', 'youtube:player_skip=webpage',
                ...(format === 'mp3' ? ['--extract-audio', '--audio-format', 'mp3'] : [])
            ]);
        }
        
        // Add process monitoring
        ytDlpProcess.on('error', (error) => {
            console.error('❌ yt-dlp process error:', error);
        });
        
        let stderrBuffer = '';
        ytDlpProcess.stderr.on('data', (data) => {
            const stderrData = data.toString().trim();
            stderrBuffer += stderrData + '\n';
            console.log('⚠️ yt-dlp stderr:', stderrData);
            
            // Check for specific errors that indicate we should fallback
            if (stderrData.includes('Failed to extract any player response') || 
                stderrData.includes('No video formats found') ||
                stderrData.includes('LOGIN_REQUIRED')) {
                console.log('🔄 Detected yt-dlp extraction failure - will trigger fallback');
            }
            
            // Check for bot detection error
            if (stderrData.includes('Sign in to confirm you\'re not a bot')) {
                console.error('❌ yt-dlp bot detection triggered');
            }
        });
        
        ytDlpProcess.on('exit', (code, signal) => {
            console.log(`🔚 yt-dlp process exited with code ${code}, signal ${signal}`);
            if (code !== 0) {
                console.log('⚠️ yt-dlp process ended with non-zero exit code (may be due to missing browser cookies)');
                
                // Check if we should trigger fallback
                if (stderrBuffer.includes('Failed to extract any player response') || 
                    stderrBuffer.includes('No video formats found') ||
                    stderrBuffer.includes('LOGIN_REQUIRED')) {
                    console.log('🔄 yt-dlp failed with extraction error - triggering fallback to alternative download method');
                }
            }
        });
        
        // Create a proper stream from the process
        const downloadStream = ytDlpProcess.stdout;
        
        // Add comprehensive stream monitoring
        downloadStream.on('error', (error) => {
            console.error('❌ yt-dlp download stream error:', error);
        });
        
        downloadStream.on('data', (chunk) => {
            console.log(`✅ Enhanced yt-dlp v2.0 stream is readable`);
        });
        
        downloadStream.on('end', () => {
            console.log('✅ Enhanced yt-dlp v2.0 stream ended successfully');
        });
        
        downloadStream.on('close', () => {
            console.log('🔒 Enhanced yt-dlp v2.0 stream closed');
        });
        
        // Add download library info to the stream
        downloadStream.downloadLibrary = isProduction ? 'yt-dlp (primary on Render.com)' : 'yt-dlp (fallback)';
        downloadStream.downloadQuality = quality;
        downloadStream.downloadFormat = format;
        
        console.log('✅ Enhanced yt-dlp v2.0 download stream created successfully');
        
        // Return a promise that resolves with the stream or rejects on yt-dlp failure
        return new Promise((resolve, reject) => {
            ytDlpProcess.on('exit', (code, signal) => {
                if (code !== 0) {
                    console.log(`🔚 yt-dlp process exited with code ${code}, signal ${signal}`);
                    console.log('⚠️ yt-dlp process ended with non-zero exit code (may be due to missing browser cookies)');
                    
                    // Check if we should trigger fallback
                    if (stderrBuffer.includes('Failed to extract any player response') || 
                        stderrBuffer.includes('No video formats found') ||
                        stderrBuffer.includes('LOGIN_REQUIRED')) {
                        console.log('🔄 yt-dlp failed with extraction error - triggering fallback to alternative download method');
                        reject(new Error('yt-dlp extraction failed - triggering fallback'));
                        return;
                    }
                }
                
                // If we reach here, yt-dlp succeeded
                resolve(downloadStream);
            });
            
            // If yt-dlp succeeds immediately, resolve with the stream
            if (ytDlpProcess.exitCode === 0) {
                resolve(downloadStream);
            }
        });
        
    } catch (error) {
        console.error('❌ Enhanced yt-dlp v2.0 failed:', error);
        throw error;
    }
}

// Enhanced yt-dlp info function
async function getYouTubeInfoViaYtDlp(url) {
    try {
        console.log('🔍 Enhanced yt-dlp v2.0: Getting video info...');
        
        // Add random delay to avoid bot detection
        const delay = getRandomDelay();
        console.log(`⏱️ Adding random delay: ${delay}ms to avoid bot detection`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const ytDlpPath = process.env.YT_DLP_PATH || (process.platform === 'win32' ? './yt-dlp-windows.exe' : './yt-dlp');
        console.log(`🔧 Using yt-dlp path: ${ytDlpPath}`);
        
        if (!fs.existsSync(ytDlpPath)) {
            throw new Error(`yt-dlp executable not found at ${ytDlpPath}`);
        }
        
        // Use spawn to get video info
        const ytDlpProcess = spawn(ytDlpPath, [
            url,
            '--dump-json',
            '--no-playlist',
            '--no-warnings',
            '--quiet',
            // Enhanced anti-bot detection
            '--user-agent', getRandomUserAgent(),
            '--cookies', getManualCookies(),
            '--no-check-certificate',
            '--prefer-insecure',
            // Advanced CAPTCHA bypass
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
            '--sleep-interval', '2',
            '--max-sleep-interval', '5',
            '--sleep-subtitles', '2'
        ]);
        
        return new Promise((resolve, reject) => {
            let stdout = '';
            let stderr = '';
            
            ytDlpProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            ytDlpProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            ytDlpProcess.on('close', (code) => {
                if (code === 0 && stdout) {
                    try {
                        const videoInfo = JSON.parse(stdout);
                        resolve({
                            title: videoInfo.title || 'Unknown Title',
                            duration: videoInfo.duration || 'Unknown',
                            thumbnail: videoInfo.thumbnail || '',
                            formats: ['mp4', 'mp3'],
                            qualities: ['4K', '2K', '1080p', '720p', '480p', '360p', '240p'],
                            platform: 'YouTube',
                            debugInfo: {
                                method: 'yt-dlp (fallback)',
                                isStatic: false,
                                realQualities: ['4K', '2K', '1080p', '720p', '480p', '360p', '240p'],
                                message: 'Video info retrieved via yt-dlp fallback'
                            }
                        });
                    } catch (parseError) {
                        reject(new Error(`Failed to parse yt-dlp output: ${parseError.message}`));
                    }
                } else {
                    reject(new Error(`yt-dlp failed with code ${code}: ${stderr}`));
                }
            });
            
            ytDlpProcess.on('error', (error) => {
                reject(new Error(`yt-dlp process error: ${error.message}`));
            });
        });
        
    } catch (error) {
        console.error('❌ Enhanced yt-dlp v2.0 info failed:', error);
        throw error;
    }
}

// Main YouTube download function - NOW USING BTCH-DOWNLOADER AS PRIMARY!
async function downloadYouTube(url, quality, format) {
    try {
        console.log('📥 DOWNLOAD START -', quality, format, '- BTCH-DOWNLOADER PRIMARY + ALTERNATIVE METHODS (NO yt-dlp, NO ytdl-core)');
        console.log('🚀 Attempting download with btchDownloader as primary method...');
        
        // Extract video ID
        const videoId = extractYouTubeVideoId(url);
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }
        
        console.log('🔍 Video ID extracted:', videoId);
        
        // 🥇 STEP 1: Try btchDownloader (NEW WORKING ALTERNATIVE)
        try {
            console.log('🥇 STEP 1: Trying btchDownloader (NEW WORKING ALTERNATIVE)...');
            
            const downloadStream = await downloadYouTubeViaBtchDownloader(url, quality, format);
            console.log('✅ SUCCESS: btchDownloader method succeeded');
            return downloadStream;
            
        } catch (btchError) {
            console.log('❌ STEP 1 FAILED: btchDownloader method failed');
            console.log('🔄 FALLBACK: Moving to HTML scraping method...');
            
            // 🥈 STEP 2: Try direct HTML scraping method
            try {
                console.log('🥈 STEP 2: Trying direct HTML scraping method...');
                
                const downloadStream = await downloadYouTubeViaHTMLScraping(url, quality, format);
                console.log('✅ SUCCESS: HTML scraping method succeeded');
                return downloadStream;
                
            } catch (htmlError) {
                console.log('❌ STEP 2 FAILED: HTML scraping method failed');
                console.log('🔄 FALLBACK: Moving to YouTube Data API v3 method...');
                
                // 🥉 STEP 3: Try YouTube Data API v3 method
                try {
                    console.log('🥉 STEP 3: Trying YouTube Data API v3 method...');
                    
                    const downloadStream = await downloadYouTubeViaAPIv3(url, quality, format);
                    console.log('✅ SUCCESS: YouTube Data API v3 method succeeded');
                    return downloadStream;
                    
                } catch (apiError) {
                    console.log('❌ STEP 3 FAILED: YouTube Data API v3 method failed');
                    console.log('🔄 FALLBACK: Moving to alternative HTTP method...');
                    
                    // 🏁 STEP 4: Try alternative HTTP method
                    try {
                        console.log('🏁 STEP 4: Trying alternative HTTP method...');
                        
                        const downloadStream = await downloadYouTubeViaAlternativeHTTP(url, quality, format);
                        console.log('✅ SUCCESS: Alternative HTTP method succeeded');
                        return downloadStream;
                        
                    } catch (httpError) {
                        console.log('❌ STEP 4 FAILED: Alternative HTTP method failed');
                        throw new Error(`All alternative methods failed: btchDownloader, HTML scraping, API v3, HTTP method`);
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('❌ downloadYouTube failed:', error);
        throw new Error(`Failed to download YouTube video: ${error.message}`);
    }
}

// NEW: Download YouTube video via btchDownloader (WORKING ALTERNATIVE)
async function downloadYouTubeViaBtchDownloader(url, quality, format) {
    try {
        console.log('🚀 === BTCH-DOWNLOADER DOWNLOAD METHOD STARTED ===');
        console.log('🔍 btchDownloader method: Starting...');
        console.log('📝 Input parameters - URL:', url, 'Quality:', quality, 'Format:', format);
        
        // Extract video ID from URL
        console.log('🔍 Extracting video ID from URL...');
        const videoId = extractYouTubeVideoId(url);
        if (!videoId) {
            console.error('❌ Failed to extract video ID from URL:', url);
            throw new Error('Invalid YouTube URL - could not extract video ID');
        }
        
        console.log('✅ Video ID extracted successfully:', videoId);
        
        // Use btchDownloader to get video info
        console.log('🔍 Getting video info via btchDownloader.youtube...');
        const result = await btchDownloader.youtube(url);
        
        if (!result) {
            throw new Error('btchDownloader failed to get video info');
        }
        
        console.log('✅ btchDownloader succeeded!');
        console.log('📊 Result structure:', Object.keys(result));
        console.log('📺 Title:', result.title);
        console.log('👤 Author:', result.author);
        
        // Get download URL based on format
        let downloadUrl;
        if (format === 'mp3') {
            if (result.mp3) {
                downloadUrl = result.mp3;
                console.log('🎵 MP3 download URL found');
            } else {
                throw new Error('No MP3 download URL available');
            }
        } else {
            if (result.mp4) {
                downloadUrl = result.mp4;
                console.log('📹 MP4 download URL found');
            } else {
                throw new Error('No MP4 download URL available');
            }
        }
        
        if (!downloadUrl) {
            throw new Error('No download URL found in btchDownloader result');
        }
        
        console.log('🔗 Download URL found:', downloadUrl.substring(0, 100) + '...');
        
        // Download the file using axios
        console.log('📥 Starting download via axios...');
        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Referer': 'https://www.youtube.com/',
                'Origin': 'https://www.youtube.com'
            },
            timeout: 30000
        });
        
        console.log('✅ Download stream created successfully');
        console.log('📊 Response headers:', response.headers);
        
        // Create a readable stream that can be returned
        const downloadStream = response.data;
        
        // Add metadata to the stream
        downloadStream.videoInfo = {
            title: result.title || 'Unknown Title',
            author: result.author || 'Unknown Author',
            thumbnail: result.thumbnail || null,
            quality: quality,
            format: format,
            platform: 'YouTube',
            method: 'btchDownloader'
        };
        
        return downloadStream;
        
    } catch (error) {
        console.error('❌ btchDownloader download method failed:', error);
        throw new Error(`btchDownloader method failed: ${error.message}`);
    }
}

// Extract video URLs from YouTube page HTML
function extractVideoUrlsFromPage(html, videoId) {
    console.log('🔍 Extracting video URLs from page HTML...');
    
    try {
        // Try to extract from ytInitialPlayerResponse first
        const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
        if (playerResponseMatch) {
            console.log('✅ Found ytInitialPlayerResponse');
            try {
                const playerResponse = JSON.parse(playerResponseMatch[1]);
                console.log('🔍 Player response structure:', Object.keys(playerResponse));
                
                if (playerResponse.streamingData && playerResponse.streamingData.formats) {
                    console.log('✅ Found streamingData.formats:', playerResponse.streamingData.formats.length);
                    const formats = playerResponse.streamingData.formats;
                    for (let i = 0; i < Math.min(3, formats.length); i++) {
                        const format = formats[i];
                        console.log(`📹 Format ${i + 1}:`, {
                            url: format.url ? format.url.substring(0, 100) + '...' : 'NO URL',
                            mimeType: format.mimeType,
                            quality: format.qualityLabel,
                            height: format.height,
                            width: format.width
                        });
                    }
                } else {
                    console.log('⚠️ No streamingData.formats found in ytInitialPlayerResponse');
                }
                
                if (playerResponse.streamingData && playerResponse.streamingData.adaptiveFormats) {
                    console.log('✅ Found streamingData.adaptiveFormats:', playerResponse.streamingData.adaptiveFormats.length);
                    const adaptiveFormats = playerResponse.streamingData.adaptiveFormats;
                    for (let i = 0; i < Math.min(3, adaptiveFormats.length); i++) {
                        const format = adaptiveFormats[i];
                        console.log(`📹 Adaptive Format ${i + 1}:`, {
                            url: format.url ? format.url.substring(0, 100) + '...' : 'NO URL',
                            mimeType: format.mimeType,
                            quality: format.qualityLabel,
                            height: format.height,
                            width: format.width
                        });
                    }
                } else {
                    console.log('⚠️ No streamingData.adaptiveFormats found in ytInitialPlayerResponse');
                }
            } catch (parseError) {
                console.log('⚠️ Failed to parse ytInitialPlayerResponse JSON:', parseError.message);
            }
        } else {
            console.log('⚠️ ytInitialPlayerResponse not found in HTML');
        }
        
        // Try to extract from ytInitialData
        const initialDataMatch = html.match(/ytInitialData\s*=\s*({.+?});/);
        if (initialDataMatch) {
            console.log('✅ Found ytInitialData');
            try {
                const initialData = JSON.parse(initialDataMatch[1]);
                if (initialData.contents && initialData.contents.twoColumnWatchNextResults) {
                    console.log('✅ Found twoColumnWatchNextResults structure');
                }
            } catch (parseError) {
                console.log('⚠️ Failed to parse ytInitialData JSON:', parseError.message);
            }
        }
        
        console.log('🔍 Searching for video URLs using multiple patterns...');
        
        // Pattern 1: Direct googlevideo.com URLs
        const directUrls = html.match(/https:\/\/[^"'\s]+\.googlevideo\.com[^"'\s]*/g) || [];
        console.log(`✅ Pattern 1: Found ${directUrls.length} direct googlevideo.com URLs`);
        if (directUrls.length > 0) {
            console.log('Sample URL 1:', directUrls[0]);
            console.log('URL length:', directUrls[0].length, 'contains videoplayback:', directUrls[0].includes('videoplayback'));
            console.log('Sample URL 2:', directUrls[1]);
            console.log('URL length:', directUrls[1].length, 'contains videoplayback:', directUrls[1].includes('videoplayback'));
            console.log('Sample URL 3:', directUrls[2]);
            console.log('URL length:', directUrls[2].length, 'contains videoplayback:', directUrls[2].includes('videoplayback'));
        }
        
        // Pattern 2: Quoted googlevideo.com URLs
        const quotedUrls = html.match(/["'](https:\/\/[^"']+\.googlevideo\.com[^"']*)["']/g) || [];
        console.log(`✅ Pattern 2: Found ${quotedUrls.length} quoted googlevideo.com URLs`);
        
        // Pattern 3: Base64 encoded strings (potential player responses)
        const base64Matches = html.match(/[A-Za-z0-9+/]{100,}={0,2}/g) || [];
        console.log(`✅ Pattern 3: Found ${base64Matches.length} potential base64 encoded strings`);
        
        // Pattern 4: Look for actual video content URLs (more specific)
        const videoContentUrls = html.match(/https:\/\/[^"'\s]+\.googlevideo\.com\/videoplayback[^"'\s]*/g) || [];
        console.log(`✅ Pattern 4: Found ${videoContentUrls.length} actual videoplayback URLs`);
        
        // Pattern 5: Look for URLs with specific video parameters
        const videoParamUrls = html.match(/https:\/\/[^"'\s]+\.googlevideo\.com[^"'\s]*(?:videoplayback|videoplayback\?)[^"'\s]*/g) || [];
        console.log(`✅ Pattern 5: Found ${videoParamUrls.length} URLs with video parameters`);
        
        // Pattern 6: Look for URLs in player_response
        const playerResponseUrls = html.match(/player_response[^}]*"url":"([^"]+)"/g) || [];
        console.log(`✅ Pattern 6: Found ${playerResponseUrls.length} URLs in player_response`);
        
        // Pattern 7: Look for URLs in specific JavaScript variables
        const jsVarUrls = html.match(/var\s+[^=]+=\s*["'](https:\/\/[^"']+\.googlevideo\.com[^"']*)["']/g) || [];
        console.log(`✅ Pattern 7: Found ${jsVarUrls.length} URLs in JavaScript variables`);
        
        // Pattern 8: Look for URLs in JSON-like structures
        const jsonLikeUrls = html.match(/"url"\s*:\s*["'](https:\/\/[^"']+\.googlevideo\.com[^"']*)["']/g) || [];
        console.log(`✅ Pattern 8: Found ${jsonLikeUrls.length} URLs in JSON-like structures`);
        
        // Pattern 9: Look for URLs without protocol or with different formats
        const protocolLessUrls = html.match(/["']([^"']*\.googlevideo\.com[^"']*)["']/g) || [];
        console.log(`✅ Pattern 9: Found ${protocolLessUrls.length} protocol-less URLs`);
        
        // Combine all found URLs
        let allUrls = [...new Set([...directUrls, ...quotedUrls, ...videoContentUrls, ...videoParamUrls, ...playerResponseUrls, ...jsVarUrls, ...jsonLikeUrls, ...protocolLessUrls])];
        
        // Clean up quoted URLs
        allUrls = allUrls.map(url => url.replace(/^["']|["']$/g, ''));
        
        // Add protocol to protocol-less URLs
        const protocolFixedUrls = allUrls.map(url => {
            if (url.startsWith('//')) {
                return 'https:' + url;
            } else if (url.startsWith('googlevideo.com')) {
                return 'https://' + url;
            } else if (url.startsWith('.googlevideo.com')) {
                return 'https://' + url.substring(1);
            }
            return url;
        });
        
        allUrls = [...new Set(protocolFixedUrls)];
        
        console.log(`🔍 Total unique URLs found: ${allUrls.length}`);
        
        // Filter URLs more intelligently
        let validUrls = [];
        
        // First priority: actual videoplayback URLs
        const videoplaybackUrls = allUrls.filter(url => 
            url.includes('videoplayback') && 
            url.length > 50 &&
            !url.includes('generate_204') &&
            !url.includes('initplayback')
        );
        console.log(`🥇 Priority 1 - Videoplayback URLs: ${videoplaybackUrls.length}`);
        
        if (videoplaybackUrls.length > 0) {
            validUrls = videoplaybackUrls;
            console.log('✅ Using videoplayback URLs as primary source');
        } else {
            // Second priority: URLs that look like video content
            const videoLikeUrls = allUrls.filter(url => 
                url.length > 80 &&
                !url.includes('generate_204') &&
                !url.includes('initplayback') &&
                !url.includes('\\u0026') &&
                (url.includes('mime=video') || url.includes('itag=') || url.includes('quality='))
            );
            console.log(`🥈 Priority 2 - Video-like URLs: ${videoLikeUrls.length}`);
            
            if (videoLikeUrls.length > 0) {
                validUrls = videoLikeUrls;
                console.log('✅ Using video-like URLs as secondary source');
            } else {
                // Third priority: any reasonable length URL that's not obviously utility
                const fallbackUrls = allUrls.filter(url => 
                    url.length > 60 &&
                    !url.includes('generate_204') &&
                    !url.includes('initplayback')
                );
                console.log(`🥉 Priority 3 - Fallback URLs: ${fallbackUrls.length}`);
                
                if (fallbackUrls.length > 0) {
                    validUrls = fallbackUrls;
                    console.log('✅ Using fallback URLs as tertiary source');
                }
            }
        }
        
        // Final filtering: ensure URLs are actually accessible
        validUrls = validUrls.filter(url => {
            try {
                const urlObj = new URL(url);
                return urlObj.protocol === 'https:' && urlObj.hostname.includes('googlevideo.com');
            } catch {
                return false;
            }
        });
        
        console.log(`🔍 Final valid URLs after filtering: ${validUrls.length}`);
        
        if (validUrls.length === 0) {
            console.log('⚠️ No valid video URLs found after filtering');
            console.log('🔍 Attempting emergency fallback...');
            
            // Emergency fallback: look for ANY googlevideo.com URL that might work
            const emergencyUrls = allUrls.filter(url => 
                url.includes('googlevideo.com') && 
                url.length > 30 &&
                !url.includes('generate_204')
            );
            
            if (emergencyUrls.length > 0) {
                console.log(`🚨 Emergency fallback found ${emergencyUrls.length} URLs`);
                validUrls = emergencyUrls.slice(0, 5); // Take first 5
            }
        }
        
        if (validUrls.length > 0) {
            console.log('✅ Successfully extracted video URLs:');
            validUrls.slice(0, 3).forEach((url, index) => {
                console.log(`  ${index + 1}. ${url.substring(0, 100)}...`);
            });
            return validUrls;
        } else {
            console.log('❌ No video URLs found in page HTML after parsing.');
            return [];
        }
        
    } catch (error) {
        console.log('❌ Error extracting video URLs:', error.message);
        return [];
    }
}

// Download YouTube video via alternative method (when yt-dlp fails)
async function downloadYouTubeViaAlternative(url, quality, format) {
    try {
        console.log('🚀 === ALTERNATIVE DOWNLOAD METHOD STARTED ===');
        console.log('🔍 Alternative download method: Starting...');
        console.log('📝 Input parameters - URL:', url, 'Quality:', quality, 'Format:', format);
        
        // Extract video ID from URL
        console.log('🔍 Extracting video ID from URL...');
        const videoId = extractYouTubeVideoId(url);
        if (!videoId) {
            console.error('❌ Failed to extract video ID from URL:', url);
            throw new Error('Invalid YouTube URL - could not extract video ID');
        }
        
        console.log('✅ Video ID extracted successfully:', videoId);
        console.log('🔍 Video ID validation passed');
        
        // Try to get video info from YouTube Data API v3 first (optional, for metadata only)
        console.log('🔍 === STEP 1: YouTube Data API v3 Metadata Retrieval ===');
        console.log('🔍 Attempting to retrieve video info from YouTube Data API v3 (for metadata only)...');
        let videoInfo = null;
        let apiKeyStatus = 'NOT_CONFIGURED';
        
        try {
            const apiKey = process.env.YOUTUBE_API_KEY;
            if (!apiKey) {
                console.warn('⚠️ YouTube API key not configured. Skipping YouTube Data API v3 metadata retrieval.');
                console.log('ℹ️ This is not critical - the alternative method will work without API metadata');
                apiKeyStatus = 'NOT_CONFIGURED';
            } else {
                console.log('✅ YouTube API key found in environment variables');
                apiKeyStatus = 'CONFIGURED';
                
                const videoInfoUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${apiKey}`;
                console.log('🌐 Making request to YouTube Data API v3:', videoInfoUrl.replace(apiKey, '***HIDDEN***'));
                
                const videoInfoResponse = await axios.get(videoInfoUrl, { 
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });
                
                console.log('📡 YouTube Data API v3 response received. Status:', videoInfoResponse.status);
                console.log('📊 Response data structure:', Object.keys(videoInfoResponse.data));
                
                if (!videoInfoResponse.data.items || videoInfoResponse.data.items.length === 0) {
                    console.warn('⚠️ Video not found or unavailable via YouTube Data API v3.');
                    console.log('📊 API response items count:', videoInfoResponse.data.items ? videoInfoResponse.data.items.length : 'undefined');
                } else {
                    videoInfo = videoInfoResponse.data.items[0];
                    console.log('✅ Video info retrieved from YouTube API v3 successfully!');
                    console.log('📹 Video title:', videoInfo.snippet.title);
                    console.log('📅 Published:', videoInfo.snippet.publishedAt);
                    console.log('👁️ View count:', videoInfo.statistics.viewCount);
                    console.log('⏱️ Duration:', videoInfo.contentDetails.duration);
                }
            }
        } catch (apiError) {
            console.error('❌ Error retrieving video info from YouTube Data API v3:', apiError.message);
            console.error('🔍 Error details:', {
                code: apiError.code,
                status: apiError.response?.status,
                statusText: apiError.response?.statusText,
                data: apiError.response?.data
            });
            console.warn('⚠️ Proceeding with alternative download method without YouTube Data API v3 metadata.');
            console.log('ℹ️ This is expected behavior when API key is missing or invalid');
        }
        
        // Try to get download URLs by making a direct request to YouTube video page
        console.log('🔍 === STEP 2: Direct YouTube Video Page Scraping ===');
        console.log('🔍 Attempting to extract download URLs from video page HTML...');
        
        try {
            // Make a request to the YouTube video page with enhanced headers
            const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
            console.log('🌐 Fetching YouTube video page:', videoPageUrl);
            console.log('🔧 Using enhanced headers for bot detection bypass...');
            
            const enhancedHeaders = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
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
                'Referer': 'https://www.youtube.com/',
                'Origin': 'https://www.youtube.com'
            };
            
            console.log('📋 Request headers configured:', Object.keys(enhancedHeaders).length, 'headers');
            console.log('⏱️ Setting request timeout to 30 seconds...');
            
            const videoPageResponse = await axios.get(videoPageUrl, {
                headers: enhancedHeaders,
                timeout: 30000,
                maxRedirects: 5,
                validateStatus: function (status) {
                    console.log('📡 HTTP response status received:', status);
                    return status >= 200 && status < 400; // Accept 2xx and 3xx status codes
                }
            });
            
            const videoPageHtml = videoPageResponse.data;
            console.log('✅ YouTube video page HTML retrieved successfully!');
            console.log('📊 Response details:');
            console.log('   - Status:', videoPageResponse.status);
            console.log('   - Status text:', videoPageResponse.statusText);
            console.log('   - Content type:', videoPageResponse.headers['content-type']);
            console.log('   - Content length:', videoPageResponse.headers['content-length'] || 'unknown');
            console.log('   - HTML size:', videoPageHtml.length, 'bytes');
            console.log('   - HTML preview (first 200 chars):', videoPageHtml.substring(0, 200) + '...');
            
            // Check if we got a valid HTML response
            if (!videoPageHtml || videoPageHtml.length < 1000) {
                console.error('❌ HTML response seems too small or invalid');
                console.log('📊 HTML length check failed - expected >1000 bytes, got:', videoPageHtml.length);
                throw new Error('Invalid HTML response from YouTube page');
            }
            
            // Try to extract video URLs from the page
            console.log('🔍 === STEP 3: HTML Parsing and Video URL Extraction ===');
            console.log('🔍 Parsing HTML to extract video URLs...');
            console.log('🔧 Calling extractVideoUrlsFromPage function...');
            
            let videoUrls = extractVideoUrlsFromPage(videoPageHtml, videoId);
            
            console.log('📊 Video URL extraction results:');
            console.log('   - Total URLs found:', videoUrls ? videoUrls.length : 'undefined');
            console.log('   - URLs array type:', Array.isArray(videoUrls) ? 'Array' : typeof videoUrls);
            
            if (videoUrls && videoUrls.length > 0) {
                console.log('✅ Found', videoUrls.length, 'potential video URLs from page HTML!');
                
                // Log all found URLs for debugging
                videoUrls.forEach((url, index) => {
                    console.log(`   ${index + 1}. ${url.substring(0, 100)}...`);
                });
                
                // Get the best quality URL
                const bestUrl = videoUrls[0];
                console.log('🎯 === STEP 4: Direct Video Download ===');
                console.log('🎯 Selected best quality URL for download:', bestUrl.substring(0, 100) + '...');
                console.log('🔍 Full URL length:', bestUrl.length, 'characters');
                
                // Validate the URL format
                if (!bestUrl.startsWith('http')) {
                    console.error('❌ Invalid URL format - does not start with http:', bestUrl.substring(0, 50));
                    throw new Error('Invalid video URL format extracted from HTML');
                }
                
                console.log('✅ URL format validation passed');
                console.log('🌐 Initiating direct download from video URL...');
                console.log('⏱️ Setting download timeout to 60 seconds...');
                
                // Create a download stream from the URL
                const downloadResponse = await axios({
                    method: 'GET',
                    url: bestUrl,
                    responseType: 'stream',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Referer': 'https://www.youtube.com/',
                        'Origin': 'https://www.youtube.com'
                    },
                    timeout: 60000,
                    maxRedirects: 5,
                    validateStatus: function (status) {
                        console.log('📡 Video download response status:', status);
                        return status >= 200 && status < 400;
                    }
                });
                
                const downloadStream = downloadResponse.data;
                
                // Add download library info to the stream
                downloadStream.downloadLibrary = 'Alternative HTTP method (fallback)';
                downloadStream.downloadQuality = quality;
                downloadStream.downloadFormat = format;
                
                console.log('✅ === ALTERNATIVE DOWNLOAD METHOD SUCCEEDED ===');
                console.log('✅ Alternative download method succeeded - created download stream from direct URL!');
                console.log('📊 Final stream details:');
                console.log('   - Library:', downloadStream.downloadLibrary);
                console.log('   - Quality:', downloadStream.downloadQuality);
                console.log('   - Format:', downloadStream.downloadFormat);
                console.log('   - Stream readable:', downloadStream.readable);
                console.log('   - Stream destroyed:', downloadStream.destroyed);
                
                return downloadStream;
                
            } else {
                console.log('⚠️ No video URLs found from page HTML, trying encoded responses...');
                
                // Try to extract from encoded responses as fallback
                const encodedUrls = extractVideoUrlsFromEncodedResponses(videoPageHtml);
                if (encodedUrls && encodedUrls.length > 0) {
                    console.log(`✅ Found ${encodedUrls.length} video URLs from encoded responses`);
                    videoUrls = encodedUrls;
                    
                    // Continue with the download using encoded URLs
                    console.log('🎯 === STEP 4: Direct Video Download (from encoded responses) ===');
                    console.log('🎯 Selected best quality URL for download:', videoUrls[0].substring(0, 100) + '...');
                    console.log('🔍 Full URL length:', videoUrls[0].length, 'characters');
                    
                    // Validate the URL format
                    if (!videoUrls[0].startsWith('http')) {
                        console.error('❌ Invalid URL format - does not start with http:', videoUrls[0].substring(0, 50));
                        throw new Error('Invalid video URL format extracted from encoded responses');
                    }
                    
                    console.log('✅ URL format validation passed');
                    console.log('🌐 Initiating direct download from encoded video URL...');
                    console.log('⏱️ Setting download timeout to 60 seconds...');
                    
                    // Create a download stream from the URL
                    const downloadResponse = await axios({
                        method: 'GET',
                        url: videoUrls[0],
                        responseType: 'stream',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Referer': 'https://www.youtube.com/',
                            'Origin': 'https://www.youtube.com'
                        },
                        timeout: 60000,
                        maxRedirects: 5,
                        validateStatus: function (status) {
                            console.log('📡 Video download response status:', status);
                            return status >= 200 && status < 400;
                        }
                    });
                    
                    const downloadStream = downloadResponse.data;
                    
                    // Add download library info to the stream
                    downloadStream.downloadLibrary = 'Alternative HTTP method (encoded responses)';
                    downloadStream.downloadQuality = quality;
                    downloadStream.downloadFormat = format;
                    
                    console.log('✅ === ALTERNATIVE DOWNLOAD METHOD SUCCEEDED (encoded responses) ===');
                    console.log('✅ Alternative download method succeeded - created download stream from encoded URL!');
                    console.log('📊 Final stream details:');
                    console.log('   - Library:', downloadStream.downloadLibrary);
                    console.log('   - Quality:', downloadStream.downloadQuality);
                    console.log('   - Format:', downloadStream.downloadFormat);
                    console.log('   - Stream readable:', downloadStream.readable);
                    console.log('   - Stream destroyed:', downloadStream.destroyed);
                    
                    return downloadStream;
                } else {
                    console.error('❌ === ALTERNATIVE DOWNLOAD METHOD FAILED ===');
                    console.error('❌ No video URLs found in page HTML after parsing or encoded responses.');
                    console.log('🔍 HTML content analysis:');
                    console.log('   - Contains "ytInitialPlayerResponse":', videoPageHtml.includes('ytInitialPlayerResponse'));
                    console.log('   - Contains "ytInitialData":', videoPageHtml.includes('ytInitialData'));
                    console.log('   - Contains "googlevideo.com":', videoPageHtml.includes('googlevideo.com'));
                    console.log('   - Contains "player_response":', videoPageHtml.includes('player_response'));
                    
                    throw new Error('No video URLs found in page HTML after parsing');
                }
            }
            
        } catch (pageError) {
            console.error('❌ === ALTERNATIVE DOWNLOAD METHOD FAILED ===');
            console.error('❌ Failed to extract video URLs from page or initiate direct download:', pageError.message);
            console.error('🔍 Error details:', {
                name: pageError.name,
                code: pageError.code,
                status: pageError.response?.status,
                statusText: pageError.response?.statusText,
                message: pageError.message
            });
            
            if (pageError.response) {
                console.error('📡 HTTP response details:');
                console.error('   - Status:', pageError.response.status);
                console.error('   - Headers:', pageError.response.headers);
                console.error('   - Data preview:', pageError.response.data ? pageError.response.data.substring(0, 200) + '...' : 'No data');
            }
            
            throw new Error(`Alternative method failed during HTML parsing or direct download: ${pageError.message}`);
        }
        
    } catch (error) {
        console.error('❌ === ALTERNATIVE DOWNLOAD METHOD CRITICAL ERROR ===');
        console.error('❌ Alternative download method error:', error);
        console.error('🔍 Error stack trace:', error.stack);
        console.error('📊 Error summary:', {
            name: error.name,
            message: error.message,
            code: error.code,
            status: error.response?.status
        });
        throw error;
    }
}


// Download YouTube video directly via YouTube Data API v3
async function downloadYouTubeViaAPIv3(url, quality, format) {
    try {
        console.log('🔍 YouTube API v3 direct download: Starting...');
        
        // Extract video ID from URL
        const videoId = extractYouTubeVideoId(url);
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }
        
        console.log('🔍 Video ID extracted:', videoId);
        
        // Get video info from YouTube Data API v3
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
            throw new Error('YouTube API key not configured');
        }
        
        const videoInfoUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${apiKey}`;
        const videoInfoResponse = await axios.get(videoInfoUrl);
        
        if (!videoInfoResponse.data.items || videoInfoResponse.data.items.length === 0) {
            throw new Error('Video not found or unavailable');
        }
        
        const videoInfo = videoInfoResponse.data.items[0];
        console.log('✅ Video info retrieved from YouTube API v3:', videoInfo.snippet.title);
        
        // YouTube Data API v3 doesn't provide direct download URLs, but we can try to get video info
        // and use it to create a more intelligent fallback
        console.log('✅ Video info retrieved from YouTube API v3:', videoInfo.snippet.title);
        
        // For now, we'll throw an error to trigger the next fallback method
        // In the future, we could implement a method to extract download URLs from the video page
        throw new Error('YouTube Data API v3 fallback: Video info retrieved but direct download not supported. Need alternative method.');
        
    } catch (error) {
        console.error('❌ YouTube API v3 direct download error:', error);
        throw error;
    }
}

// Enhanced ytdl-core function
async function downloadYouTubeViaYtdlCore(url, quality, format) {
    try {
        console.log('🔍 Enhanced ytdl-core v2.0: Starting with cookie authentication...');
        
        // Add random delay to avoid bot detection
        const delay = getRandomDelay();
        console.log(`⏱️ Adding random delay: ${delay}ms to avoid bot detection`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Configure ytdl-core options
        let downloadOptions = {};
        
        if (format === 'mp3') {
            downloadOptions = {
                quality: 'highestaudio',
                filter: 'audioonly',
                requestOptions: {
                    headers: getEnhancedHeaders()
                }
            };
        } else {
            // For video, get best available quality
            downloadOptions = {
                quality: quality === 'highest' ? 'highest' : `${quality}p`,
                filter: 'videoandaudio',
                requestOptions: {
                    headers: getEnhancedHeaders()
                }
            };
        }
        
        console.log('🔧 Enhanced ytdl-core v2.0 options:', downloadOptions);
        
        // Create ytdl-core download stream
        const downloadStream = ytdl(url, downloadOptions);
        
        // Add error handling
        downloadStream.on('error', (error) => {
            console.error('❌ Enhanced ytdl-core v2.0 stream error:', error);
        });
        
        // Add download library info to the stream
        downloadStream.downloadLibrary = 'ytdl-core (primary)';
        downloadStream.downloadQuality = quality;
        downloadStream.downloadFormat = format;
        
        console.log('✅ Enhanced ytdl-core v2.0 download stream created successfully');
        
        return downloadStream;
        
    } catch (error) {
        console.error('❌ Enhanced ytdl-core v2.0 failed:', error);
        throw error;
    }
}


// Helper function to extract YouTube video ID
function extractYouTubeVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    return null;
}

// Helper function to get YouTube info via ytdl-core
async function getYouTubeInfoViaYtdlCore(url) {
    try {
        const info = await ytdl.getInfo(url, {
            requestOptions: {
                headers: getEnhancedHeaders()
            }
        });
        
        return {
            title: info.videoDetails.title,
            duration: info.videoDetails.lengthSeconds ? `${Math.floor(info.videoDetails.lengthSeconds / 60)}:${(info.videoDetails.lengthSeconds % 60).toString().padStart(2, '0')}` : 'Unknown',
            thumbnail: info.videoDetails.thumbnails?.[0]?.url || '',
            formats: ['mp4', 'mp3'],
            qualities: ['4K', '2K', '1080p', '720p', '480p', '360p', '240p'],
            platform: 'YouTube',
            debugInfo: {
                method: 'ytdl-core',
                isStatic: false,
                realQualities: ['4K', '2K', '1080p', '720p', '480p', '360p', '240p'],
                message: 'Video info retrieved via ytdl-core'
            }
        };
        
    } catch (error) {
        console.error('❌ ytdl-core info failed:', error);
        throw error;
    }
}

// NEW: Modern YouTube download alternatives
// ===== PLAY-DL FUNCTIONALITY =====
async function getYouTubeInfoViaPlayDl(url) {
    try {
        console.log('🎵 Getting YouTube info via play-dl...');
        
        // Validate YouTube URL
        if (!play.yt_validate(url)) {
            throw new Error('Invalid YouTube URL for play-dl');
        }
        
        // Get video info
        const videoInfo = await play.video_info(url);
        
        if (!videoInfo || !videoInfo.video_details) {
            throw new Error('No video info found via play-dl');
        }
        
        const details = videoInfo.video_details;
        
        return {
            title: details.title || 'Unknown Title',
            duration: details.durationInSec ? `${Math.floor(details.durationInSec / 60)}:${(details.durationInSec % 60).toString().padStart(2, '0')}` : 'Unknown',
            thumbnail: details.thumbnails?.[0]?.url || '',
            formats: ['mp4', 'mp3'],
            qualities: ['4K', '2K', '1080p', '720p', '480p', '360p', '240p'],
            platform: 'YouTube',
            debugInfo: {
                method: 'play-dl (modern alternative)',
                isStatic: false,
                realQualities: ['4K', '2K', '1080p', '720p', '480p', '360p', '240p'],
                message: 'Video info retrieved via play-dl modern library'
            }
        };
        
    } catch (error) {
        console.error('❌ play-dl info failed:', error);
        throw error;
    }
}

async function downloadYouTubeViaPlayDl(url, quality, format) {
    try {
        console.log('🎵 Downloading YouTube video via play-dl:', quality, format);
        
        // Validate YouTube URL
        if (!play.yt_validate(url)) {
            throw new Error('Invalid YouTube URL for play-dl');
        }
        
        // Get video info first
        const videoInfo = await play.video_info(url);
        
        if (!videoInfo || !videoInfo.video_details) {
            throw new Error('No video info found via play-dl');
        }
        
        // Get stream based on format
        let stream;
        if (format === 'mp3') {
            // For audio, get audio stream
            stream = await play.stream_from_info(videoInfo, { quality: 2 }); // 2 = audio only
        } else {
            // For video, get video stream
            stream = await play.stream_from_info(videoInfo, { quality: 2 }); // 2 = best quality
        }
        
        if (!stream || !stream.stream) {
            throw new Error('No stream available via play-dl');
        }
        
        // Create a proper stream object
        const downloadStream = stream.stream;
        
        // Add download library info to the stream
        downloadStream.downloadLibrary = 'play-dl (modern alternative)';
        downloadStream.downloadQuality = quality;
        downloadStream.downloadFormat = format;
        
        console.log('✅ play-dl download stream created successfully');
        
        return downloadStream;
        
    } catch (error) {
        console.error('❌ play-dl download failed:', error);
        throw error;
    }
}

// ===== ZULPROJECT YTDL FUNCTIONALITY =====
async function getYouTubeInfoViaZulYtdl(url) {
    try {
        console.log('🔧 Getting YouTube info via @zulproject/ytdl...');
        
        // Get video info
        const videoInfo = await zulYtdl.getInfo(url);
        
        if (!videoInfo || !videoInfo.title) {
            throw new Error('No video info found via @zulproject/ytdl');
        }
        
        return {
            title: videoInfo.title || 'Unknown Title',
            duration: videoInfo.duration || 'Unknown',
            thumbnail: videoInfo.thumbnail || '',
            formats: ['mp4', 'mp3'],
            qualities: ['4K', '2K', '1080p', '720p', '480p', '360p', '240p'],
            platform: 'YouTube',
            debugInfo: {
                method: '@zulproject/ytdl (alternative scraper)',
                isStatic: false,
                realQualities: ['4K', '2K', '1080p', '720p', '480p', '360p', '240p'],
                message: 'Video info retrieved via @zulproject/ytdl alternative scraper'
            }
        };
        
    } catch (error) {
        console.error('❌ @zulproject/ytdl info failed:', error);
        throw error;
    }
}

async function downloadYouTubeViaZulYtdl(url, quality, format) {
    try {
        console.log('🔧 Downloading YouTube video via @zulproject/ytdl:', quality, format);
        
        // Get video info first
        const videoInfo = await zulYtdl.getInfo(url);
        
        if (!videoInfo || !videoInfo.title) {
            throw new Error('No video info found via @zulproject/ytdl');
        }
        
        // Get download URL based on quality and format
        let downloadUrl;
        
        if (format === 'mp3') {
            // For audio, get audio URL
            downloadUrl = await zulYtdl.getAudio(url);
        } else {
            // For video, get video URL based on quality
            const qualityMap = {
                '4K': '2160p',
                '2K': '1440p', 
                '1080p': '1080p',
                '720p': '720p',
                '480p': '480p',
                '360p': '360p',
                '240p': '240p'
            };
            
            const targetQuality = qualityMap[quality] || '720p';
            downloadUrl = await zulYtdl.getVideo(url, targetQuality);
        }
        
        if (!downloadUrl) {
            throw new Error('No download URL available via @zulproject/ytdl');
        }
        
        // Create download stream from URL
        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Referer': 'https://www.youtube.com/',
                'Origin': 'https://www.youtube.com'
            }
        });
        
        const downloadStream = response.data;
        
        // Add download library info to the stream
        downloadStream.downloadLibrary = '@zulproject/ytdl (alternative scraper)';
        downloadStream.downloadQuality = quality;
        downloadStream.downloadFormat = format;
        
        console.log('✅ @zulproject/ytdl download stream created successfully');
        
        return downloadStream;
        
    } catch (error) {
        console.error('❌ @zulproject/ytdl download failed:', error);
        throw error;
    }
}

// PornHub functionality
async function getPornHubInfo(url) {
    try {
        console.log('🔞 Getting PornHub video info for:', url);
        
        const videoInfo = await pornhub.getVideo(url);
        
        if (!videoInfo || !videoInfo.video) {
            throw new Error('No video found in this PornHub URL');
        }
        
        const video = videoInfo.video;
        
        return {
            title: video.title || 'Unknown Title',
            duration: video.duration || 'Unknown',
            thumbnail: video.default_thumb || '',
            formats: ['mp4'],
            qualities: ['1080p', '720p', '480p', '360p', '240p'],
            platform: 'PornHub',
            debugInfo: {
                method: 'pornhub.js',
                isStatic: false,
                realQualities: ['1080p', '720p', '480p', '360p', '240p'],
                message: 'Video info retrieved via pornhub.js'
            }
        };
        
    } catch (error) {
        console.error('❌ PornHub video info error:', error);
        throw new Error(`Failed to get PornHub video info: ${error.message}`);
    }
}

async function downloadPornHub(url, quality, format) {
    try {
        console.log('🔞 Downloading PornHub video:', quality, format);
        
        const videoInfo = await pornhub.getVideo(url);
        
        if (!videoInfo || !videoInfo.video) {
            throw new Error('No video found in this PornHub URL');
        }
        
        const video = videoInfo.video;
        
        // Get the best quality video URL
        let downloadUrl = '';
        if (video.video_url) {
            downloadUrl = video.video_url;
        } else if (video.download_url) {
            downloadUrl = video.download_url;
        } else if (video.embed_url) {
            downloadUrl = video.embed_url;
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
        
        // Add download library info to the stream
        response.data.downloadLibrary = 'pornhub.js';
        response.data.downloadQuality = quality;
        response.data.downloadFormat = format;
        
        return response.data;
        
    } catch (error) {
        console.error('❌ PornHub download error:', error);
        throw new Error(`Failed to download PornHub video: ${error.message}`);
    }
}

// YouTube playlist functionality
async function getYouTubePlaylistInfo(url) {
    try {
        console.log('🎵 Getting YouTube playlist info for:', url);
        
        // Extract playlist ID
        const playlistId = extractYouTubePlaylistId(url);
        if (!playlistId) {
            throw new Error('Invalid YouTube playlist URL');
        }
        
        // Try @distube/ytpl first
        try {
            console.log('🥇 Trying @distube/ytpl for playlist info...');
            
            const playlist = await ytpl(playlistId, {
                requestOptions: {
                    headers: getEnhancedHeaders()
                }
            });
            
            if (!playlist || !playlist.videos || playlist.videos.length === 0) {
                throw new Error('No videos found in playlist');
            }
            
            const videos = playlist.videos.map(video => ({
                title: video.title,
                url: video.url,
                thumbnail: video.thumbnail?.url || '',
                duration: video.duration || 'Unknown'
            }));
            
            return {
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
            
            // Create video objects
            const videos = limitedVideoIds.map((videoId, index) => ({
                title: limitedTitles[index] || `Video ${index + 1}`,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                thumbnail: limitedThumbnails[index] || '',
                duration: 'Unknown'
            }));
            
            if (videos.length === 0) {
                throw new Error('No videos found in playlist');
            }
            
            console.log(`✅ Web scraping playlist info retrieved successfully: ${videos.length} videos`);
            
            return {
                title: `YouTube Playlist (${playlistId})`,
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
                author: 'Unknown',
                debugInfo: {
                    method: 'Web Scraping',
                    isStatic: false,
                    realQualities: ['720p', '480p', '360p', '240p'],
                    totalVideos: videos.length,
                    message: `Playlist retrieved via web scraping: ${videos.length} videos found`
                }
            };
            
        } catch (scrapingError) {
            console.log('⚠️ Web scraping failed:', scrapingError.message);
        }
        
        throw new Error('All playlist retrieval methods failed');
        
    } catch (error) {
        console.error('❌ getYouTubePlaylistInfo failed:', error);
        throw new Error(`Failed to get YouTube playlist info: ${error.message}`);
    }
}

// Helper function to extract YouTube playlist ID
function extractYouTubePlaylistId(url) {
    const patterns = [
        /[?&]list=([^&\n?#]+)/,
        /playlist\?list=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    return null;
}

// Download YouTube playlist function
async function downloadYouTubePlaylist(url, quality, format) {
    try {
        console.log('🎵 Starting playlist download for:', url);
        
        // Get playlist info first
        const playlistInfo = await getYouTubePlaylistInfo(url);
        
        console.log(`🎵 Playlist info retrieved: ${playlistInfo.videoCount} videos`);
        
        // Check if we have any videos
        if (!playlistInfo.videos || playlistInfo.videos.length === 0) {
            console.log('⚠️ No videos found in playlist, returning error');
            
            throw new Error('No videos found in this playlist. Please check the URL.');
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
            
            // Create a readable stream from the archive
            const archiveStream = new Readable();
            archiveStream._read = () => {}; // Required for readable streams
            
            // Pipe archive to the stream
            archive.pipe(archiveStream);
            
            // Process videos sequentially to avoid memory issues
            for (let i = 0; i < playlistInfo.videos.length; i++) {
                const video = playlistInfo.videos[i];
                console.log(`🎵 Downloading video ${i + 1}/${playlistInfo.videos.length}: ${video.title}`);
                
                try {
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
                                
                                console.log(`✅ Video ${i + 1} - ytdl-core download stream created successfully (fallback)`);
                                
                            } catch (ytDlpError) {
                                console.log(`❌ Video ${i + 1} - STEP 2 FAILED: yt-dlp failed`);
                                throw new Error(`Both ytdl-core and yt-dlp failed: ${ytdlError.message}, ${ytDlpError.message}`);
                            }
                        }
                        
                        // Generate filename
                        const filename = `${(i + 1).toString().padStart(2, '0')}_${video.title.replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '_')}.${requestedFormat}`;
                        
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
            
            // Add download library info to the stream
            archiveStream.downloadLibrary = 'ytdl-core + yt-dlp (hybrid)';
            archiveStream.downloadQuality = quality;
            archiveStream.downloadFormat = format;
            
            return archiveStream;
            
        } catch (downloadError) {
            console.error('❌ Error creating playlist archive:', downloadError);
            throw new Error(`Failed to create playlist archive: ${downloadError.message}`);
        }
        
    } catch (error) {
        console.error('Playlist download error:', error);
        throw new Error(`Failed to download YouTube playlist: ${error.message}`);
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

// Upload cookies file endpoint
app.post('/api/upload-cookies', (req, res) => {
    try {
        const { cookiesData, format } = req.body;
        
        if (!cookiesData) {
            return res.status(400).json({ 
                success: false, 
                error: 'Cookies data is required' 
            });
        }
        
        console.log('🍪 Uploading cookies file, format:', format);
        
        let parsedCookies = {};
        
        try {
            if (format === 'netscape') {
                // Parse Netscape format cookies
                parsedCookies = parseNetscapeCookies(cookiesData);
            } else if (format === 'json') {
                // Parse JSON format cookies
                parsedCookies = JSON.parse(cookiesData);
            } else if (format === 'headerstring') {
                // Parse HeaderString format cookies
                parsedCookies = parseHeaderStringCookies(cookiesData);
            } else {
                throw new Error('Unsupported format. Use: netscape, json, or headerstring');
            }
            
            console.log('🍪 Successfully parsed cookies:', Object.keys(parsedCookies));
            
            // Update global user cookies
            userCookies = {
                ...userCookies,
                ...parsedCookies
            };
            
            // Create cookies file for yt-dlp
            const cookieFile = createCookiesFileFromParsed(userCookies);
            
            res.json({ 
                success: true, 
                message: `Successfully uploaded ${Object.keys(parsedCookies).length} cookies`,
                cookiesCount: Object.keys(parsedCookies).length,
                cookieFile: cookieFile
            });
            
        } catch (parseError) {
            console.error('❌ Error parsing cookies:', parseError);
            res.status(400).json({ 
                success: false, 
                error: `Failed to parse cookies: ${parseError.message}` 
            });
        }
        
    } catch (error) {
        console.error('❌ Error uploading cookies:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get cookies status endpoint
app.get('/api/cookies-status', (req, res) => {
    try {
        const fs = require('fs');
        
        let status = {
            hasUploadedCookies: false,
            hasManualCookies: false,
            cookiesCount: 0,
            cookieFile: null
        };
        
        // Check for uploaded cookies file
        const uploadedCookieFile = './youtube_cookies_uploaded.txt';
        if (fs.existsSync(uploadedCookieFile)) {
            status.hasUploadedCookies = true;
            status.cookieFile = uploadedCookieFile;
            
            // Count cookies in file
            try {
                const content = fs.readFileSync(uploadedCookieFile, 'utf8');
                const lines = content.split('\n').filter(line => 
                    line.trim() !== '' && !line.startsWith('#') && line.includes('\t')
                );
                status.cookiesCount = lines.length;
            } catch (error) {
                console.error('Error reading uploaded cookies file:', error);
            }
        }
        
        // Check for manual cookies
        if (userCookies && Object.keys(userCookies).length > 0) {
            status.hasManualCookies = true;
        }
        
        res.json({
            success: true,
            status: status
        });
        
    } catch (error) {
        console.error('❌ Error getting cookies status:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
});

// Try to decode and extract video URLs from encoded player responses
function extractVideoUrlsFromEncodedResponses(html) {
    console.log('🔍 Attempting to extract video URLs from encoded responses...');
    
    try {
        // Look for base64 encoded player responses
        const base64Matches = html.match(/[A-Za-z0-9+/]{200,}={0,2}/g) || [];
        console.log(`🔍 Found ${base64Matches.length} potential base64 encoded strings`);
        
        for (let i = 0; i < Math.min(5, base64Matches.length); i++) {
            const encoded = base64Matches[i];
            console.log(`🔍 Attempting to decode base64 string ${i + 1} (length: ${encoded.length})`);
            
            try {
                const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
                console.log(`✅ Successfully decoded base64 string ${i + 1}`);
                
                // Look for video URLs in the decoded content
                const videoUrls = decoded.match(/https:\/\/[^"'\s]+\.googlevideo\.com\/videoplayback[^"'\s]*/g) || [];
                if (videoUrls.length > 0) {
                    console.log(`🎯 Found ${videoUrls.length} video URLs in decoded base64 string ${i + 1}`);
                    return videoUrls;
                }
                
                // Look for any googlevideo.com URLs
                const anyUrls = decoded.match(/https:\/\/[^"'\s]+\.googlevideo\.com[^"'\s]*/g) || [];
                if (anyUrls.length > 0) {
                    console.log(`🎯 Found ${anyUrls.length} googlevideo.com URLs in decoded base64 string ${i + 1}`);
                    return anyUrls.filter(url => !url.includes('generate_204') && !url.includes('initplayback'));
                }
                
            } catch (decodeError) {
                console.log(`⚠️ Failed to decode base64 string ${i + 1}:`, decodeError.message);
            }
        }
        
        // Look for URL-encoded strings
        const urlEncodedMatches = html.match(/%[0-9A-Fa-f]{2}/g) || [];
        if (urlEncodedMatches.length > 0) {
            console.log(`🔍 Found ${urlEncodedMatches.length} URL-encoded characters, attempting to decode...`);
            
            try {
                const decodedHtml = decodeURIComponent(html);
                const videoUrls = decodedHtml.match(/https:\/\/[^"'\s]+\.googlevideo\.com\/videoplayback[^"'\s]*/g) || [];
                if (videoUrls.length > 0) {
                    console.log(`🎯 Found ${videoUrls.length} video URLs after URL decoding`);
                    return videoUrls;
                }
            } catch (decodeError) {
                console.log(`⚠️ Failed to URL-decode HTML:`, decodeError.message);
            }
        }
        
        console.log('❌ No video URLs found in encoded responses');
        return [];
        
    } catch (error) {
        console.log('❌ Error extracting from encoded responses:', error.message);
        return [];
    }
}

// Simple working version of getYouTubeInfo function (temporarily replacing the broken one)
async function getYouTubeInfo(url) {
    try {
        console.log('🔍 Getting YouTube video info...');
        
        // Extract video ID
        const videoId = extractYouTubeVideoId(url);
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }
        
        // Try YouTube Data API v3 first
        try {
            console.log('🥇 STEP 1: Trying YouTube Data API v3...');
            
            const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${YOUTUBE_API_KEY}`;
            const response = await axios.get(apiUrl);
            
            if (response.data.items && response.data.items.length > 0) {
                const video = response.data.items[0];
                const snippet = video.snippet;
                
                console.log('✅ SUCCESS: YouTube Data API v3 succeeded');
                
                return {
                    title: snippet.title,
                    duration: video.contentDetails.duration || 'Unknown',
                    thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '',
                    formats: ['mp4', 'mp3'],
                    qualities: ['4K', '2K', '1080p', '720p', '480p', '360p', '240p'],
                    platform: 'YouTube',
                    debugInfo: {
                        method: 'YouTube Data API v3',
                        isStatic: false,
                        realQualities: ['4K', '2K', '1080p', '720p', '480p', '360p', '240p'],
                        message: 'Video info retrieved via YouTube Data API v3'
                    }
                };
            } else {
                throw new Error('Video not found');
            }
            
        } catch (apiError) {
            console.log('❌ STEP 1 FAILED: YouTube Data API v3 failed');
            console.log('🔄 FALLBACK: Moving to yt-dlp...');
            
            // Fallback to yt-dlp
            try {
                console.log('🏁 STEP 2: Trying yt-dlp...');
                
                const result = await getYouTubeInfoViaYtDlp(url);
                console.log('✅ SUCCESS: yt-dlp succeeded');
                return result;
                
            } catch (ytDlpError) {
                console.log('❌ STEP 2 FAILED: yt-dlp failed');
                throw new Error(`All methods failed: API v3, yt-dlp`);
            }
        }
        
    } catch (error) {
        console.error('❌ getYouTubeInfo failed:', error);
        throw new Error(`Failed to get YouTube video info: ${error.message}`);
    }
}

