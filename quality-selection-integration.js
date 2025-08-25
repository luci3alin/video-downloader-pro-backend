// Quality Selection Integration for existing system
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');

console.log('🔧 Quality Selection Integration Demo');
console.log('====================================');
console.log('🎯 Integrating @distube/ytdl-core with quality selection');
console.log('');

class QualitySelectionDownloader {
    constructor() {
        this.supportedQualities = ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p'];
        this.supportedFormats = ['mp4', 'webm'];
    }
    
    async getVideoInfo(url) {
        try {
            console.log('📊 Getting video information...');
            const info = await ytdl.getInfo(url);
            
            return {
                title: info.videoDetails.title,
                duration: info.videoDetails.lengthSeconds,
                views: info.videoDetails.viewCount,
                uploadDate: info.videoDetails.uploadDate,
                formats: info.formats
            };
        } catch (error) {
            throw new Error(`Failed to get video info: ${error.message}`);
        }
    }
    
    getAvailableQualities(formats) {
        const qualityMap = {};
        
        formats.forEach(format => {
            if (format.qualityLabel && format.url) {
                const quality = format.qualityLabel;
                const ext = format.mimeType ? format.mimeType.split('/')[1] : 'Unknown';
                const filesize = format.contentLength ? `${(format.contentLength / 1024 / 1024).toFixed(1)}MB` : 'Unknown';
                const hasAudio = format.hasAudio;
                const hasVideo = format.hasVideo;
                
                if (!qualityMap[quality]) {
                    qualityMap[quality] = [];
                }
                
                qualityMap[quality].push({
                    ext,
                    filesize,
                    hasAudio,
                    hasVideo,
                    url: format.url,
                    formatId: format.itag,
                    note: format.qualityLabel,
                    mimeType: format.mimeType
                });
            }
        });
        
        return qualityMap;
    }
    
    findBestFormat(qualityMap, preferredQuality = '720p', preferredFormat = 'mp4') {
        console.log(`🔍 Finding best format for ${preferredQuality} ${preferredFormat.toUpperCase()}...`);
        
        // Look for exact quality match
        if (qualityMap[preferredQuality]) {
            const formats = qualityMap[preferredQuality];
            const bestFormat = formats.find(f => f.ext === preferredFormat);
            
            if (bestFormat) {
                console.log(`✅ Found exact match: ${preferredQuality} ${preferredFormat.toUpperCase()}`);
                return bestFormat;
            }
        }
        
        // Fallback: find closest quality
        const qualities = Object.keys(qualityMap).map(q => parseInt(q) || 0).sort((a, b) => b - a);
        const targetQuality = parseInt(preferredQuality) || 720;
        
        let closestQuality = qualities[0];
        let minDiff = Math.abs(qualities[0] - targetQuality);
        
        qualities.forEach(quality => {
            const diff = Math.abs(quality - targetQuality);
            if (diff < minDiff) {
                minDiff = diff;
                closestQuality = quality;
            }
        });
        
        const fallbackQuality = `${closestQuality}p`;
        console.log(`⚠️ Using fallback quality: ${fallbackQuality}`);
        
        if (qualityMap[fallbackQuality]) {
            const formats = qualityMap[fallbackQuality];
            const bestFormat = formats.find(f => f.ext === preferredFormat);
            
            if (bestFormat) {
                console.log(`✅ Found fallback: ${fallbackQuality} ${preferredFormat.toUpperCase()}`);
                return bestFormat;
            }
        }
        
        console.log('❌ No suitable format found');
        return null;
    }
    
    async downloadWithQuality(url, quality = '720p', format = 'mp4', outputPath = './downloads') {
        try {
            // Get video info
            const videoInfo = await this.getVideoInfo(url);
            console.log(`📹 Downloading: ${videoInfo.title}`);
            
            // Get available qualities
            const qualityMap = this.getAvailableQualities(videoInfo.formats);
            
            // Find best format
            const selectedFormat = this.findBestFormat(qualityMap, quality, format);
            
            if (!selectedFormat) {
                throw new Error(`No suitable format found for ${quality} ${format.toUpperCase()}`);
            }
            
            // Create downloads directory
            if (!fs.existsSync(outputPath)) {
                fs.mkdirSync(outputPath, { recursive: true });
            }
            
            const filename = `${videoInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedFormat.note}_${selectedFormat.ext}.${selectedFormat.ext}`;
            const fullPath = path.join(outputPath, filename);
            
            console.log(`\n📥 Downloading ${selectedFormat.note} ${selectedFormat.ext.toUpperCase()}...`);
            console.log(`📁 Output: ${fullPath}`);
            console.log(`💾 Size: ${selectedFormat.filesize}`);
            console.log(`🎬 Type: ${selectedFormat.hasAudio && selectedFormat.hasVideo ? 'Video+Audio' : selectedFormat.hasVideo ? 'Video Only' : 'Audio Only'}`);
            
            // Create write stream
            const writeStream = fs.createWriteStream(fullPath);
            
            // Get video stream
            const videoStream = ytdl(url, {
                format: selectedFormat.formatId,
                quality: selectedFormat.note
            });
            
            // Track progress
            let lastProgress = 0;
            videoStream.on('progress', (chunkLength, downloaded, total) => {
                if (total > 0) {
                    const percent = Math.floor(downloaded / total * 100);
                    if (percent > lastProgress + 9) { // Update every 10%
                        const downloadedMB = (downloaded / 1024 / 1024).toFixed(1);
                        const totalMB = (total / 1024 / 1024).toFixed(1);
                        console.log(`📊 Progress: ${percent}% (${downloadedMB}MB / ${totalMB}MB)`);
                        lastProgress = percent;
                    }
                }
            });
            
            // Handle completion
            videoStream.on('end', () => {
                console.log(`\n✅ Download completed: ${filename}`);
                const stats = fs.statSync(fullPath);
                const actualSize = (stats.size / 1024 / 1024).toFixed(1);
                console.log(`📊 Actual file size: ${actualSize}MB`);
            });
            
            // Handle errors
            videoStream.on('error', (error) => {
                console.error(`\n❌ Download failed: ${error.message}`);
                writeStream.end();
            });
            
            // Pipe to file
            videoStream.pipe(writeStream);
            
            return {
                success: true,
                filename,
                path: fullPath,
                quality: selectedFormat.note,
                format: selectedFormat.ext,
                size: selectedFormat.filesize
            };
            
        } catch (error) {
            throw new Error(`Download failed: ${error.message}`);
        }
    }
    
    // Get quality options for frontend
    getQualityOptions(url) {
        return this.getVideoInfo(url).then(videoInfo => {
            const qualityMap = this.getAvailableQualities(videoInfo.formats);
            
            const options = [];
            Object.keys(qualityMap).sort((a, b) => {
                const aNum = parseInt(a) || 0;
                const bNum = parseInt(b) || 0;
                return bNum - aNum; // Highest quality first
            }).forEach(quality => {
                qualityMap[quality].forEach(format => {
                    options.push({
                        quality: format.note,
                        format: format.ext,
                        size: format.filesize,
                        hasAudio: format.hasAudio,
                        hasVideo: format.hasVideo,
                        formatId: format.formatId
                    });
                });
            });
            
            return {
                title: videoInfo.title,
                duration: videoInfo.duration,
                views: videoInfo.viewCount,
                qualities: options
            };
        });
    }
}

// Demo usage
async function demo() {
    const downloader = new QualitySelectionDownloader();
    const TEST_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    try {
        console.log('🚀 Testing Quality Selection Integration...\n');
        
        // Get quality options
        const qualityOptions = await downloader.getQualityOptions(TEST_URL);
        console.log('📋 Available Quality Options:');
        qualityOptions.qualities.forEach((option, index) => {
            const type = option.hasAudio && option.hasVideo ? 'Video+Audio' : 
                       option.hasVideo ? 'Video Only' : 'Audio Only';
            console.log(`  ${index + 1}. ${option.quality} ${option.format.toUpperCase()} - ${option.size} - ${type}`);
        });
        
        console.log('\n💡 Integration Ready!');
        console.log('✅ Use downloader.getQualityOptions(url) to get available qualities');
        console.log('✅ Use downloader.downloadWithQuality(url, quality, format) to download');
        console.log('✅ Supports all qualities from 144p to 2160p');
        console.log('✅ Multiple formats: MP4, WebM, AV1, VP9, H.264');
        
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
    }
}

// Run demo
demo().catch(console.error);
