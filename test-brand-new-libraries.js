const ytStreamer = require('yt-streamer');
const nechlophomeriaa = require('@nechlophomeriaa/ytdl');
const ytFinderNextgen = require('yt-finder-nextgen');

const testUrl = 'https://www.youtube.com/watch?v=Kq6z4bs3W84';

console.log('🧪 === TESTING BRAND NEW YOUTUBE DOWNLOAD LIBRARIES ===\n');

// Test 1: yt-streamer (ULTRA NOU - 16 zile!)
async function testYtStreamer() {
    console.log('🔍 Testing yt-streamer (ULTRA NOU - 16 zile!)...');
    console.log('📦 Module structure:', Object.keys(ytStreamer));
    
    try {
        // Try to get video info using getDetail
        console.log('🎯 Testing yt-streamer.getDetail for video info...');
        const result = await ytStreamer.getDetail(testUrl);
        
        console.log('✅ SUCCESS: yt-streamer.getDetail');
        console.log('📊 Result structure:', Object.keys(result));
        console.log('📺 Title:', result.title || 'N/A');
        console.log('👤 Author:', result.author || 'N/A');
        
        // Check for quality options
        if (result.formats) {
            console.log('🎯 Available formats:', result.formats.length);
            console.log('📁 Format details:', result.formats.slice(0, 3));
        }
        
        console.log('📝 Full result:', JSON.stringify(result, null, 2));
        console.log('');
        
    } catch (error) {
        console.log('❌ FAILED: yt-streamer.getDetail');
        console.log('💥 Error:', error.message);
        console.log('');
    }
}

// Test 2: @nechlophomeriaa/ytdl (Custom Quality!)
async function testNechlophomeriaa() {
    console.log('🔍 Testing @nechlophomeriaa/ytdl (Custom Quality!)...');
    console.log('📦 Module structure:', Object.keys(nechlophomeriaa || {}));
    
    try {
        // Try to get video info with ytmp4
        console.log('🎯 Testing @nechlophomeriaa/ytdl.ytmp4 for video info...');
        const result = await nechlophomeriaa.ytmp4(testUrl);
        
        console.log('✅ SUCCESS: @nechlophomeriaa/ytdl.ytmp4');
        console.log('📊 Result structure:', Object.keys(result));
        console.log('📺 Title:', result.title || 'N/A');
        console.log('👤 Author:', result.author || 'N/A');
        
        // Check for quality options
        if (result.formats) {
            console.log('🎯 Available formats:', result.formats.length);
            console.log('📁 Format details:', result.formats.slice(0, 3));
        }
        
        console.log('📝 Full result:', JSON.stringify(result, null, 2));
        console.log('');
        
    } catch (error) {
        console.log('❌ FAILED: @nechlophomeriaa/ytdl.ytmp4');
        console.log('💥 Error:', error.message);
        console.log('');
    }
}

// Test 3: yt-finder-nextgen (Next Generation!)
async function testYtFinderNextgen() {
    console.log('🔍 Testing yt-finder-nextgen (Next Generation!)...');
    console.log('📦 Module structure:', Object.keys(ytFinderNextgen || {}));
    
    try {
        // Try to get video info using the yt function
        console.log('🎯 Testing yt-finder-nextgen.yt for video info...');
        const result = await ytFinderNextgen.yt(testUrl);
        
        console.log('✅ SUCCESS: yt-finder-nextgen.yt');
        console.log('📊 Result structure:', Object.keys(result));
        console.log('📺 Title:', result.title || 'N/A');
        console.log('👤 Author:', result.author || 'N/A');
        
        // Check for quality options
        if (result.formats) {
            console.log('🎯 Available formats:', result.formats.length);
            console.log('📁 Format details:', result.formats.slice(0, 3));
        }
        
        console.log('📝 Full result:', JSON.stringify(result, null, 2));
        console.log('');
        
    } catch (error) {
        console.log('❌ FAILED: yt-finder-nextgen.yt');
        console.log('💥 Error:', error.message);
        console.log('');
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting tests for:', testUrl);
    console.log('⏰ Test started at:', new Date().toLocaleTimeString());
    console.log('');
    
    await testYtStreamer();
    await testNechlophomeriaa();
    await testYtFinderNextgen();
    
    console.log('🏁 All tests completed!');
    console.log('⏰ Test finished at:', new Date().toLocaleTimeString());
}

// Run tests
runAllTests().catch(console.error);
