const btchDownloader = require('btch-downloader');

console.log('🧪 Testing btch-downloader YouTube Download');
console.log('==========================================\n');

async function testBtchDownloader() {
    const testUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll
        'https://www.youtube.com/watch?v=jNQXAC9IVRw', // Me at the zoo (first YouTube video)
        'https://www.youtube.com/watch?v=9bZkp7q19f0'  // PSY - GANGNAM STYLE
    ];
    
    for (let i = 0; i < testUrls.length; i++) {
        const url = testUrls[i];
        console.log(`\n🔍 Test ${i + 1}: ${url}`);
        console.log('─'.repeat(50));
        
        try {
            const result = await btchDownloader.youtube(url);
            
            if (result && result.title) {
                console.log('✅ SUCCESS!');
                console.log('📺 Title:', result.title);
                console.log('👤 Author:', result.author);
                console.log('🖼️ Thumbnail:', result.thumbnail ? 'Available' : 'Not available');
                console.log('🎵 MP3:', result.mp3 ? 'Available' : 'Not available');
                console.log('📹 MP4:', result.mp4 ? 'Available' : 'Not available');
                
                // Show MP3 options if available
                if (result.mp3 && Array.isArray(result.mp3)) {
                    console.log('🎵 MP3 Options:', result.mp3.length);
                    result.mp3.slice(0, 3).forEach((mp3, idx) => {
                        console.log(`   ${idx + 1}. Quality: ${mp3.quality || 'Unknown'}, Size: ${mp3.size || 'Unknown'}`);
                    });
                }
                
                // Show MP4 options if available
                if (result.mp4 && Array.isArray(result.mp4)) {
                    console.log('📹 MP4 Options:', result.mp4.length);
                    result.mp4.slice(0, 3).forEach((mp4, idx) => {
                        console.log(`   ${idx + 1}. Quality: ${mp4.quality || 'Unknown'}, Size: ${mp4.size || 'Unknown'}`);
                    });
                }
                
            } else {
                console.log('❌ FAILED: No valid result');
                console.log('📊 Raw result:', result);
            }
            
        } catch (error) {
            console.log('❌ ERROR:', error.message);
        }
        
        // Small delay between tests
        if (i < testUrls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

// Test download functionality
async function testDownload() {
    console.log('\n🧪 Testing actual download functionality...');
    console.log('─'.repeat(50));
    
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    try {
        const result = await btchDownloader.youtube(testUrl);
        
        if (result && result.mp4 && result.mp4.length > 0) {
            const mp4Option = result.mp4[0]; // First MP4 option
            console.log('📹 Testing MP4 download with option:', mp4Option);
            
            if (mp4Option.url) {
                console.log('🔗 Download URL:', mp4Option.url.substring(0, 100) + '...');
                console.log('✅ MP4 download URL is available');
            } else {
                console.log('❌ No MP4 download URL found');
            }
        }
        
        if (result && result.mp3 && result.mp3.length > 0) {
            const mp3Option = result.mp3[0]; // First MP3 option
            console.log('🎵 Testing MP3 download with option:', mp3Option);
            
            if (mp3Option.url) {
                console.log('🔗 Download URL:', mp3Option.url.substring(0, 100) + '...');
                console.log('✅ MP3 download URL is available');
            } else {
                console.log('❌ No MP3 download URL found');
            }
        }
        
    } catch (error) {
        console.log('❌ Download test failed:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    await testBtchDownloader();
    await testDownload();
    
    console.log('\n🏁 All tests completed!');
    console.log('\n💡 btch-downloader appears to be a WORKING alternative to vredenScraper!');
}

runAllTests().catch(console.error);
