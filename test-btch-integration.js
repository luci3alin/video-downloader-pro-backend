// Test the btchDownloader integration
const btchDownloader = require('btch-downloader');

console.log('🧪 Testing btchDownloader Integration');
console.log('====================================\n');

async function testIntegration() {
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    try {
        console.log('🔍 Testing btchDownloader.youtube...');
        const result = await btchDownloader.youtube(testUrl);
        
        if (result && result.title) {
            console.log('✅ SUCCESS: Video info extracted');
            console.log('📺 Title:', result.title);
            console.log('👤 Author:', result.author);
            console.log('🎵 MP3 URL:', result.mp3 ? 'Available' : 'Not available');
            console.log('📹 MP4 URL:', result.mp4 ? 'Available' : 'Not available');
            
            // Test if we can access the download URLs
            if (result.mp3) {
                console.log('🔗 MP3 URL length:', result.mp3.length);
                console.log('🔗 MP3 URL starts with:', result.mp3.substring(0, 50) + '...');
            }
            
            if (result.mp4) {
                console.log('🔗 MP4 URL length:', result.mp4.length);
                console.log('🔗 MP4 URL starts with:', result.mp4.substring(0, 50) + '...');
            }
            
            console.log('\n🎯 Integration test PASSED! btchDownloader is ready to use.');
            
        } else {
            console.log('❌ FAILED: No valid result from btchDownloader');
        }
        
    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
    }
}

testIntegration();
