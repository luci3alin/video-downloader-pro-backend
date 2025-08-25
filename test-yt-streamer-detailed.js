// Detailed test script for yt-streamer to explore its capabilities
const { getDetail, DownloadVideo, DownloadMusic } = require('yt-streamer');

console.log('🔍 Detailed yt-streamer Test');
console.log('============================');
console.log('🎯 Exploring what data yt-streamer actually provides');
console.log('');

async function testYtStreamerDetailed() {
    try {
        const TEST_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll
        
        console.log('📊 Getting video info with getDetail...');
        const info = await getDetail(TEST_URL);
        
        console.log('\n📋 Full Response Object:');
        console.log(JSON.stringify(info, null, 2));
        
        console.log('\n🔍 Analyzing response structure...');
        
        // Check all properties
        if (info) {
            console.log('\n📊 Available Properties:');
            Object.keys(info).forEach(key => {
                const value = info[key];
                const type = typeof value;
                const preview = type === 'string' ? value.substring(0, 100) : 
                              type === 'object' ? JSON.stringify(value).substring(0, 100) : 
                              String(value);
            console.log(`  • ${key}: ${type} = ${preview}`);
            });
        }
        
        // Try DownloadVideo method
        console.log('\n🎬 Testing DownloadVideo method...');
        try {
            const videoInfo = await DownloadVideo(TEST_URL);
            console.log('📹 DownloadVideo result:', JSON.stringify(videoInfo, null, 2));
        } catch (error) {
            console.log('❌ DownloadVideo failed:', error.message);
        }
        
        // Try DownloadMusic method
        console.log('\n🎵 Testing DownloadMusic method...');
        try {
            const musicInfo = await DownloadMusic(TEST_URL);
            console.log('🎵 DownloadMusic result:', JSON.stringify(musicInfo, null, 2));
        } catch (error) {
            console.log('❌ DownloadMusic failed:', error.message);
        }
        
        // Try YouTubeDL method
        console.log('\n📺 Testing YouTubeDL method...');
        try {
            const { YouTubeDL } = require('yt-streamer');
            const ytdlInfo = await YouTubeDL(TEST_URL);
            console.log('📺 YouTubeDL result:', JSON.stringify(ytdlInfo, null, 2));
        } catch (error) {
            console.log('❌ YouTubeDL failed:', error.message);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Detailed test failed:', error);
        throw error;
    }
}

// Run the detailed test
testYtStreamerDetailed().catch(console.error);
