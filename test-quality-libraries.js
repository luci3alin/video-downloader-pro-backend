// Comprehensive test script for quality selection libraries
console.log('🧪 Testing Quality Selection Libraries');
console.log('=====================================');
console.log('🎯 Focus: Multiple quality options and format support');
console.log('');

// Test URL - use a short video for testing
const TEST_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll - short video

async function testLibrary(libraryName, testFunction) {
    console.log(`\n🔍 Testing ${libraryName}...`);
    console.log('─'.repeat(50));
    
    try {
        await testFunction();
        console.log(`✅ ${libraryName} test completed successfully`);
    } catch (error) {
        console.log(`❌ ${libraryName} test failed: ${error.message}`);
    }
}

// Test 1: youtube-dl-exec (yt-dlp wrapper) - Most promising for quality selection
async function testYoutubeDlExec() {
    try {
        const youtubeDl = require('youtube-dl-exec');
        
        console.log('📊 Getting video info with yt-dlp...');
        console.log('🔍 This should provide multiple quality options');
        
        // Get video info with format list
        const info = await youtubeDl(TEST_URL, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: [
                'referer:youtube.com',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        });
        
        console.log('📹 Video Title:', info.title);
        console.log('⏱️ Duration:', info.duration);
        console.log('👁️ Views:', info.view_count);
        
        // Check available formats
        if (info.formats && info.formats.length > 0) {
            console.log('\n🎬 Available Formats:');
            console.log(`  Total formats: ${info.formats.length}`);
            
            // Group by quality
            const qualityGroups = {};
            info.formats.forEach((format, index) => {
                const quality = format.quality || format.height || 'Unknown';
                const ext = format.ext || 'Unknown';
                const filesize = format.filesize ? `${(format.filesize / 1024 / 1024).toFixed(1)}MB` : 'Unknown';
                
                if (!qualityGroups[quality]) qualityGroups[quality] = [];
                qualityGroups[quality].push({
                    ext,
                    filesize,
                    url: format.url ? '✅' : '❌',
                    note: format.format_note || ''
                });
            });
            
            // Display grouped by quality
            Object.keys(qualityGroups).sort((a, b) => {
                const aNum = parseInt(a) || 0;
                const bNum = parseInt(b) || 0;
                return bNum - aNum; // Highest quality first
            }).forEach(quality => {
                console.log(`\n  🎯 ${quality}:`);
                qualityGroups[quality].forEach(format => {
                    console.log(`    • ${format.ext} - ${format.filesize} - ${format.url} URL ${format.note ? `(${format.note})` : ''}`);
                });
            });
            
        } else {
            console.log('\n❌ No formats found');
        }
        
        return true;
    } catch (error) {
        throw new Error(`youtube-dl-exec failed: ${error.message}`);
    }
}

// Test 2: @distube/ytdl-core (enhanced ytdl-core)
async function testDistubeYtdlCore() {
    try {
        const ytdl = require('@distube/ytdl-core');
        
        console.log('📊 Getting video info with @distube/ytdl-core...');
        console.log('🔍 This should provide multiple quality options');
        
        const info = await ytdl.getInfo(TEST_URL);
        
        console.log('📹 Video Title:', info.videoDetails.title);
        console.log('⏱️ Duration:', info.videoDetails.lengthSeconds);
        console.log('👁️ Views:', info.videoDetails.viewCount);
        
        // Check available formats
        if (info.formats && info.formats.length > 0) {
            console.log('\n🎬 Available Formats:');
            console.log(`  Total formats: ${info.formats.length}`);
            
            // Group by quality
            const qualityGroups = {};
            info.formats.forEach((format, index) => {
                const quality = format.qualityLabel || format.height || 'Unknown';
                const ext = format.mimeType ? format.mimeType.split('/')[1] : 'Unknown';
                const filesize = format.contentLength ? `${(format.contentLength / 1024 / 1024).toFixed(1)}MB` : 'Unknown';
                
                if (!qualityGroups[quality]) qualityGroups[quality] = [];
                qualityGroups[quality].push({
                    ext,
                    filesize,
                    url: format.url ? '✅' : '❌',
                    note: format.qualityLabel || ''
                });
            });
            
            // Display grouped by quality
            Object.keys(qualityGroups).sort((a, b) => {
                const aNum = parseInt(a) || 0;
                const bNum = parseInt(b) || 0;
                return bNum - aNum; // Highest quality first
            }).forEach(quality => {
                console.log(`\n  🎯 ${quality}:`);
                qualityGroups[quality].forEach(format => {
                    console.log(`    • ${format.ext} - ${format.filesize} - ${format.url} URL ${format.note ? `(${format.note})` : ''}`);
                });
            });
            
        } else {
            console.log('\n❌ No formats found');
        }
        
        return true;
    } catch (error) {
        throw new Error(`@distube/ytdl-core failed: ${error.message}`);
    }
}

// Test 3: yt-streamer YouTubeDL method (working but single quality)
async function testYtStreamer() {
    try {
        const { YouTubeDL } = require('yt-streamer');
        
        console.log('📊 Getting video info with yt-streamer YouTubeDL...');
        console.log('🔍 This provides single quality but working download');
        
        const info = await YouTubeDL(TEST_URL);
        
        console.log('📹 Video Title:', info.title);
        console.log('🎯 Quality:', info.quality);
        console.log('📁 Type:', info.type);
        console.log('🔗 URL:', info.url ? 'Available' : 'Not available');
        
        console.log('\n🎬 Available Format:');
        console.log(`  • ${info.quality} ${info.type} - ✅ URL`);
        
        return true;
    } catch (error) {
        throw new Error(`yt-streamer failed: ${error.message}`);
    }
}

// Test 4: btch-downloader (working but single quality)
async function testBtchDownloader() {
    try {
        const { youtube } = require('btch-downloader');
        
        console.log('📊 Getting video info with btch-downloader...');
        console.log('🔍 This provides single quality but working download');
        
        const info = await youtube(TEST_URL);
        
        console.log('📹 Video Title:', info.title);
        console.log('⏱️ Duration:', info.duration);
        
        console.log('\n🎬 Available Formats:');
        if (info.mp3) console.log('  ✅ MP3 (Audio) - Direct download');
        if (info.mp4) console.log('  ✅ MP4 (Video) - Direct download');
        
        return true;
    } catch (error) {
        throw new Error(`btch-downloader failed: ${error.message}`);
    }
}

// Main test function
async function runAllTests() {
    console.log('🚀 Starting quality selection library testing...\n');
    
    // Test libraries in order of promise for quality selection
    await testLibrary('youtube-dl-exec', testYoutubeDlExec);
    await testLibrary('@distube/ytdl-core', testDistubeYtdlCore);
    await testLibrary('yt-streamer', testYtStreamer);
    await testLibrary('btch-downloader', testBtchDownloader);
    
    console.log('\n🎯 Test Summary:');
    console.log('✅ Libraries tested for quality selection capabilities');
    console.log('✅ Format availability checked');
    console.log('✅ Quality options explored');
    console.log('\n💡 Next steps:');
    console.log('   • youtube-dl-exec should provide multiple quality options');
    console.log('   • @distube/ytdl-core should provide multiple quality options');
    console.log('   • yt-streamer and btch-downloader provide single quality but working downloads');
}

// Run the tests
runAllTests().catch(console.error);
