const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const ytdl = require('@distube/ytdl-core');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// YouTube API Key
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyDATZtBCDsSV1Bjb8xNZmQpZBtLhTJ-htk';

// Enhanced headers for anti-bot detection
function getEnhancedHeaders() {
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
    };
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

// Get YouTube video info via YouTube Data API v3
async function getYouTubeInfoViaAPI(url) {
    try {
        const videoId = extractYouTubeVideoId(url);
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }
        
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${YOUTUBE_API_KEY}`;
        const response = await axios.get(apiUrl);
        
        if (response.data.items && response.data.items.length > 0) {
            const video = response.data.items[0];
            const snippet = video.snippet;
            
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
    } catch (error) {
        throw error;
    }
}

// Get YouTube video info via yt-dlp
async function getYouTubeInfoViaYtDlp(url) {
    return new Promise((resolve, reject) => {
        const ytDlpProcess = spawn('./yt-dlp', [
            '--dump-json',
            '--no-playlist',
            url
        ], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';

        ytDlpProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        ytDlpProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        ytDlpProcess.on('close', (code) => {
            if (code === 0 && output) {
                try {
                    const info = JSON.parse(output);
                    resolve({
                        title: info.title || 'Unknown Title',
                        duration: info.duration ? `${Math.floor(info.duration / 60)}:${(info.duration % 60).toString().padStart(2, '0')}` : 'Unknown',
                        thumbnail: info.thumbnail || '',
                        formats: ['mp4', 'mp3'],
                        qualities: ['4K', '2K', '1080p', '720p', '480p', '360p', '240p'],
                        platform: 'YouTube',
                        debugInfo: {
                            method: 'yt-dlp',
                            isStatic: false,
                            realQualities: ['4K', '2K', '1080p', '720p', '480p', '360p', '240p'],
                            message: 'Video info retrieved via yt-dlp'
                        }
                    });
                } catch (parseError) {
                    reject(new Error(`Failed to parse yt-dlp output: ${parseError.message}`));
                }
            } else {
                reject(new Error(`yt-dlp failed with code ${code}: ${errorOutput}`));
            }
        });

        ytDlpProcess.on('error', (error) => {
            reject(new Error(`yt-dlp spawn error: ${error.message}`));
        });
    });
}

// Main getYouTubeInfo function
async function getYouTubeInfo(url) {
    try {
        console.log('🔍 Getting YouTube video info...');
        
        // Try YouTube Data API v3 first
        try {
            console.log('🥇 STEP 1: Trying YouTube Data API v3...');
            const result = await getYouTubeInfoViaAPI(url);
            console.log('✅ SUCCESS: YouTube Data API v3 succeeded');
            return result;
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

// Download YouTube video via yt-dlp
async function downloadYouTubeViaYtDlp(url, quality, format) {
    return new Promise((resolve, reject) => {
        const args = [
            '--format', 'best[ext=mp4]/best',
            '--output', '-',
            url
        ];

        if (format === 'mp3') {
            args.splice(1, 2, '--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0');
        }

        const ytDlpProcess = spawn('./yt-dlp', args, {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        ytDlpProcess.on('error', (error) => {
            reject(new Error(`yt-dlp spawn error: ${error.message}`));
        });

        ytDlpProcess.stderr.on('data', (data) => {
            console.log('yt-dlp stderr:', data.toString());
        });

        ytDlpProcess.on('close', (code) => {
            if (code === 0) {
                console.log('yt-dlp process completed successfully');
            } else {
                console.log(`yt-dlp process exited with code ${code}`);
            }
        });

        resolve(ytDlpProcess.stdout);
    });
}

// Main download function
async function downloadYouTube(url, quality, format) {
    try {
        console.log('📥 DOWNLOAD START -', quality, format);
        
        // Use yt-dlp as the primary method
        try {
            console.log('🚀 Attempting download with yt-dlp...');
            const downloadStream = await downloadYouTubeViaYtDlp(url, quality, format);
            console.log('✅ SUCCESS: yt-dlp download completed');
            return downloadStream;
        } catch (ytDlpError) {
            console.log('❌ yt-dlp failed:', ytDlpError.message);
            throw new Error('yt-dlp download failed');
        }
    } catch (error) {
        console.error('❌ Download failed:', error);
        throw new Error(`Failed to download YouTube video: ${error.message}`);
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/youtube/info', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ success: false, error: 'URL is required' });
        }
        
        const info = await getYouTubeInfo(url);
        res.json({ success: true, data: info });
        
    } catch (error) {
        console.error('❌ Error getting YouTube info:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/youtube/download', async (req, res) => {
    try {
        const { url, quality, format } = req.body;
        
        if (!url) {
            return res.status(400).json({ success: false, error: 'URL is required' });
        }
        
        const downloadStream = await downloadYouTube(url, quality, format);
        
        res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="video.${format}"`);
        
        downloadStream.pipe(res);
        
    } catch (error) {
        console.error('❌ Error downloading YouTube video:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
});
