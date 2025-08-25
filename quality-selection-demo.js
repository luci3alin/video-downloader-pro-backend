// Quality Selection Demo using @distube/ytdl-core
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');

console.log('🎯 Quality Selection Demo with @distube/ytdl-core');
console.log('================================================');
console.log('✅ This library provides 50+ quality options!');
console.log('');

// Test URL
const TEST_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

async function getVideoInfo(url) {
    try {
        console.log('📊 Getting video information...');
        const info = await ytdl.getInfo(url);
        
        console.log('📹 Title:', info.videoDetails.title);
        console.log('⏱️ Duration:', Math.floor(info.videoDetails.lengthSeconds / 60) + ':' + (info.videoDetails.lengthSeconds % 60).toString().padStart(2, '0'));
        console.log('👁️ Views:', info.videoDetails.viewCount.toLocaleString());
        console.log('📅 Upload Date:', new Date(info.videoDetails.uploadDate).toLocaleDateString());
        
        return info;
    } catch (error) {
        throw new Error(`Failed to get video info: ${error.message}`);
    }
}

function displayQualityOptions(formats) {
    console.log('\n🎬 Available Quality Options:');
    console.log('─'.repeat(80));
    
    // Group formats by quality
    const qualityGroups = {};
    
    formats.forEach(format => {
        if (format.qualityLabel) {
            const quality = format.qualityLabel;
            const ext = format.mimeType ? format.mimeType.split('/')[1] : 'Unknown';
            const filesize = format.contentLength ? `${(format.contentLength / 1024 / 1024).toFixed(1)}MB` : 'Unknown';
            const hasAudio = format.hasAudio;
            const hasVideo = format.hasVideo;
            
            if (!qualityGroups[quality]) {
                qualityGroups[quality] = [];
            }
            
            qualityGroups[quality].push({
                ext,
                filesize,
                hasAudio,
                hasVideo,
                url: format.url,
                formatId: format.itag,
                note: format.qualityLabel
            });
        }
    });
    
    // Display grouped by quality (highest first)
    Object.keys(qualityGroups)
        .sort((a, b) => {
            const aNum = parseInt(a) || 0;
            const bNum = parseInt(b) || 0;
            return bNum - aNum;
        })
        .forEach(quality => {
            console.log(`\n🎯 ${quality}:`);
            qualityGroups[quality].forEach(format => {
                const type = format.hasAudio && format.hasVideo ? 'Video+Audio' : 
                           format.hasVideo ? 'Video Only' : 'Audio Only';
                const status = format.url ? '✅' : '❌';
                
                console.log(`  • ${format.ext} - ${format.filesize} - ${type} - ${status} URL (ID: ${format.formatId})`);
            });
        });
    
    return qualityGroups;
}

function findBestFormat(qualityGroups, preferredQuality = '720p', preferredFormat = 'mp4') {
    console.log(`\n🔍 Finding best format for ${preferredQuality} ${preferredFormat.toUpperCase()}...`);
    
    // Look for exact quality match
    if (qualityGroups[preferredQuality]) {
        const formats = qualityGroups[preferredQuality];
        const bestFormat = formats.find(f => f.ext === preferredFormat && f.hasVideo && f.hasAudio);
        
        if (bestFormat) {
            console.log(`✅ Found perfect match: ${preferredQuality} ${preferredFormat.toUpperCase()}`);
            return bestFormat;
        }
    }
    
    // Fallback: find closest quality
    const qualities = Object.keys(qualityGroups).map(q => parseInt(q) || 0).sort((a, b) => b - a);
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
    
    if (qualityGroups[fallbackQuality]) {
        const formats = qualityGroups[fallbackQuality];
        const bestFormat = formats.find(f => f.ext === preferredFormat && f.hasVideo && f.hasAudio);
        
        if (bestFormat) {
            console.log(`✅ Found fallback: ${fallbackQuality} ${preferredFormat.toUpperCase()}`);
            return bestFormat;
        }
    }
    
    console.log('❌ No suitable format found');
    return null;
}

async function downloadVideo(url, format, outputPath = './downloads') {
    try {
        // Create downloads directory
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }
        
        const filename = `video_${format.note.replace(/\s+/g, '_')}_${format.ext}.${format.ext}`;
        const fullPath = path.join(outputPath, filename);
        
        console.log(`\n📥 Downloading ${format.note} ${format.ext.toUpperCase()}...`);
        console.log(`📁 Output: ${fullPath}`);
        console.log(`💾 Size: ${format.filesize}`);
        
        // Create write stream
        const writeStream = fs.createWriteStream(fullPath);
        
        // Get video stream
        const videoStream = ytdl(url, {
            format: format.formatId,
            quality: format.note
        });
        
        // Track progress
        let downloadedBytes = 0;
        const totalBytes = format.contentLength || 0;
        
        videoStream.on('progress', (chunkLength, downloaded, total) => {
            downloadedBytes = downloaded;
            if (total > 0) {
                const percent = (downloaded / total * 100).toFixed(1);
                const downloadedMB = (downloaded / 1024 / 1024).toFixed(1);
                const totalMB = (total / 1024 / 1024).toFixed(1);
                process.stdout.write(`\r📊 Progress: ${percent}% (${downloadedMB}MB / ${totalMB}MB)`);
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
        
    } catch (error) {
        throw new Error(`Download failed: ${error.message}`);
    }
}

async function main() {
    try {
        // Get video info
        const info = await getVideoInfo(TEST_URL);
        
        // Display quality options
        const qualityGroups = displayQualityOptions(info.formats);
        
        // Find best format for 720p MP4
        const bestFormat = findBestFormat(qualityGroups, '720p', 'mp4');
        
        if (bestFormat) {
            console.log('\n🎯 Selected Format:');
            console.log(`  Quality: ${bestFormat.note}`);
            console.log(`  Format: ${bestFormat.ext.toUpperCase()}`);
            console.log(`  Size: ${bestFormat.filesize}`);
            console.log(`  Has Audio: ${bestFormat.hasAudio ? 'Yes' : 'No'}`);
            console.log(`  Has Video: ${bestFormat.hasVideo ? 'Yes' : 'No'}`);
            
            // Ask user if they want to download
            console.log('\n💡 To download this video, uncomment the downloadVideo call below');
            // await downloadVideo(TEST_URL, bestFormat);
            
        } else {
            console.log('\n❌ No suitable format found for download');
        }
        
        console.log('\n🎉 Quality Selection Demo Complete!');
        console.log('✅ @distube/ytdl-core provides excellent quality selection');
        console.log('✅ Multiple formats and codecs available');
        console.log('✅ Direct download URLs for each quality');
        
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
    }
}

// Run the demo
main().catch(console.error);
