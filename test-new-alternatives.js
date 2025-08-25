const btchDownloader = require('btch-downloader');
const denethYtmp3 = require('denethdev-ytmp3');

console.log('🧪 Testing NEW YouTube Download Alternatives');
console.log('==========================================\n');

// Test btch-downloader
async function testBtchDownloader() {
    console.log('🔍 Testing btch-downloader...');
    try {
        console.log('📊 btch-downloader structure:', Object.keys(btchDownloader));
        
        // Check if it has YouTube methods
        if (typeof btchDownloader.youtube === 'function') {
            console.log('✅ btch-downloader.youtube is available');
        } else {
            console.log('❌ btch-downloader.youtube is NOT available');
        }
        
        if (typeof btchDownloader.ytdl === 'function') {
            console.log('✅ btch-downloader.ytdl is available');
        } else {
            console.log('❌ btch-downloader.ytdl is NOT available');
        }
        
        console.log('📋 Available methods:', Object.getOwnPropertyNames(btchDownloader));
        
    } catch (error) {
        console.error('❌ btch-downloader test failed:', error.message);
    }
}

// Test denethdev-ytmp3
async function testDenethYtmp3() {
    console.log('\n🔍 Testing denethdev-ytmp3...');
    try {
        console.log('📊 denethdev-ytmp3 structure:', Object.keys(denethYtmp3));
        
        // Check if it has the expected methods
        if (typeof denethYtmp3.download === 'function') {
            console.log('✅ denethdev-ytmp3.download is available');
        } else {
            console.log('❌ denethdev-ytmp3.download is NOT available');
        }
        
        console.log('📋 Available methods:', Object.getOwnPropertyNames(denethYtmp3));
        
    } catch (error) {
        console.error('❌ denethdev-ytmp3 test failed:', error.message);
    }
}

// Test with a real YouTube URL
async function testRealDownload() {
    console.log('\n🧪 Testing with real YouTube URL...');
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    try {
        // Test btch-downloader if available
        if (typeof btchDownloader.youtube === 'function') {
            console.log('🔍 Testing btch-downloader.youtube with real URL...');
            try {
                const result = await btchDownloader.youtube(testUrl);
                console.log('✅ btch-downloader.youtube SUCCESS:', {
                    hasData: !!result,
                    dataType: typeof result,
                    keys: result ? Object.keys(result) : 'NO RESULT'
                });
            } catch (error) {
                console.log('❌ btch-downloader.youtube failed:', error.message);
            }
        }
        
        // Test denethdev-ytmp3 if available
        if (typeof denethYtmp3.download === 'function') {
            console.log('🔍 Testing denethdev-ytmp3.download with real URL...');
            try {
                const result = await denethYtmp3.download(testUrl);
                console.log('✅ denethdev-ytmp3.download SUCCESS:', {
                    hasData: !!result,
                    dataType: typeof result,
                    keys: result ? Object.keys(result) : 'NO RESULT'
                });
            } catch (error) {
                console.log('❌ denethdev-ytmp3.download failed:', error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Real download test failed:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    await testBtchDownloader();
    await testDenethYtmp3();
    await testRealDownload();
    
    console.log('\n🏁 All tests completed!');
}

runAllTests().catch(console.error);
