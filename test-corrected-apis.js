// Corrected test script using actual API methods for each library
console.log('🧪 Testing YouTube Libraries with Correct APIs');
console.log('=============================================');
console.log('🎯 Focus: Quality selection and format support');
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

// Test 1: @dark-yasiya/scrap - using correct API
async function testDarkYasiyaScrap() {
    try {
        const { yt } = require('@dark-yasiya/scrap');
        
        console.log('📊 Getting video info...');
        const info = await yt(TEST_URL);
        
        console.log('📹 Video Title:', info.title);
        console.log('⏱️ Duration:', info.duration);
        
        // Check available formats
        if (info.formats) {
            console.log('\n🎬 Available Formats:');
            info.formats.forEach((format, index) => {
                console.log(`  ${index + 1}. ${format.quality || 'Unknown'} - ${format.url ? '✅' : '❌'} URL`);
            });
        }
        
        // Check for any quality-related properties
        console.log('\n🔍 Checking for quality properties...');
        const qualityProps = Object.keys(info).filter(key => 
            key.toLowerCase().includes('quality') || 
            key.toLowerCase().includes('resolution') ||
            key.toLowerCase().includes('size')
        );
        
        if (qualityProps.length > 0) {
            qualityProps.forEach(prop => {
                console.log(`  ✅ ${prop}: ${JSON.stringify(info[prop])}`);
            });
        } else {
            console.log('  ❌ No quality-related properties found');
        }
        
        return true;
    } catch (error) {
        throw new Error(`Dark Yasiya scrap failed: ${error.message}`);
    }
}

// Test 2: yt-streamer - using correct API
async function testYtStreamer() {
    try {
        const { DownloadVideo, getDetail } = require('yt-streamer');
        
        console.log('📊 Getting video info...');
        console.log('🔍 Testing getDetail method...');
        
        const info = await getDetail(TEST_URL);
        
        console.log('📹 Video Title:', info.title || 'Unknown');
        console.log('⏱️ Duration:', info.duration || 'Unknown');
        
        // Check available formats
        if (info.formats) {
            console.log('\n🎬 Available Formats:');
            info.formats.forEach((format, index) => {
                console.log(`  ${index + 1}. ${format.quality || 'Unknown'} - ${format.url ? '✅' : '❌'} URL`);
            });
        }
        
        // Check for quality options
        console.log('\n🔍 Checking for quality properties...');
        const qualityProps = Object.keys(info).filter(key => 
            key.toLowerCase().includes('quality') || 
            key.toLowerCase().includes('resolution') ||
            key.toLowerCase().includes('size')
        );
        
        if (qualityProps.length > 0) {
            qualityProps.forEach(prop => {
                console.log(`  ✅ ${prop}: ${JSON.stringify(info[prop])}`);
            });
        } else {
            console.log('  ❌ No quality-related properties found');
        }
        
        return true;
    } catch (error) {
        throw new Error(`yt-streamer failed: ${error.message}`);
    }
}

// Test 3: @bochilteam/scraper-youtube - using correct API
async function testBochilTeamScraper() {
    try {
        const { youtubedl } = require('@bochilteam/scraper-youtube');
        
        console.log('📊 Getting video info...');
        const info = await youtubedl(TEST_URL);
        
        console.log('📹 Video Title:', info.title || 'Unknown');
        console.log('⏱️ Duration:', info.duration || 'Unknown');
        
        // Check available formats
        if (info.formats) {
            console.log('\n🎬 Available Formats:');
            info.formats.forEach((format, index) => {
                console.log(`  ${index + 1}. ${format.quality || 'Unknown'} - ${format.url ? '✅' : '❌'} URL`);
            });
        }
        
        // Check for quality options
        console.log('\n🔍 Checking for quality properties...');
        const qualityProps = Object.keys(info).filter(key => 
            key.toLowerCase().includes('quality') || 
            key.toLowerCase().includes('resolution') ||
            key.toLowerCase().includes('size')
        );
        
        if (qualityProps.length > 0) {
            qualityProps.forEach(prop => {
                console.log(`  ✅ ${prop}: ${JSON.stringify(info[prop])}`);
            });
        } else {
            console.log('  ❌ No quality-related properties found');
        }
        
        return true;
    } catch (error) {
        throw new Error(`bochilteam scraper failed: ${error.message}`);
    }
}

// Test 4: @nechlophomeriaa/ytdl - using correct API
async function testNechlophomeriaaYtdl() {
    try {
        const { yt } = require('@nechlophomeriaa/ytdl');
        
        console.log('📊 Getting video info...');
        const info = await yt(TEST_URL);
        
        console.log('📹 Video Title:', info.title || 'Unknown');
        console.log('⏱️ Duration:', info.duration || 'Unknown');
        
        // Check available formats
        if (info.formats) {
            console.log('\n🎬 Available Formats:');
            info.formats.forEach((format, index) => {
                console.log(`  ${index + 1}. ${format.quality || 'Unknown'} - ${format.url ? '✅' : '❌'} URL`);
            });
        }
        
        // Check for quality options
        console.log('\n🔍 Checking for quality properties...');
        const qualityProps = Object.keys(info).filter(key => 
            key.toLowerCase().includes('quality') || 
            key.toLowerCase().includes('resolution') ||
            key.toLowerCase().includes('size')
        );
        
        if (qualityProps.length > 0) {
            qualityProps.forEach(prop => {
                console.log(`  ✅ ${prop}: ${JSON.stringify(info[prop])}`);
            });
        } else {
            console.log('  ❌ No quality-related properties found');
        }
        
        return true;
    } catch (error) {
        throw new Error(`nechlophomeriaa ytdl failed: ${error.message}`);
    }
}

// Test 5: btch-downloader (working, but let's see if we can get more info)
async function testBtchDownloader() {
    try {
        const { youtube } = require('btch-downloader');
        
        console.log('📊 Getting video info...');
        const info = await youtube(TEST_URL);
        
        console.log('📹 Video Title:', info.title);
        console.log('⏱️ Duration:', info.duration);
        
        // Check what we actually get
        console.log('\n🎬 Available Formats:');
        if (info.mp3) console.log('  ✅ MP3 (Audio)');
        if (info.mp4) console.log('  ✅ MP4 (Video)');
        
        // Check if we can get quality options
        if (info.qualities) {
            console.log('\n🎯 Available Qualities:');
            info.qualities.forEach(quality => {
                console.log(`  • ${quality}`);
            });
        } else {
            console.log('\n🎯 Quality Info: Single quality per format (MP3/MP4)');
        }
        
        return true;
    } catch (error) {
        throw new Error(`btch-downloader failed: ${error.message}`);
    }
}

// Main test function
async function runAllTests() {
    console.log('🚀 Starting corrected API testing...\n');
    
    // Test all libraries with correct APIs
    await testLibrary('@dark-yasiya/scrap', testDarkYasiyaScrap);
    await testLibrary('yt-streamer', testYtStreamer);
    await testLibrary('@bochilteam/scraper-youtube', testBochilTeamScraper);
    await testLibrary('@nechlophomeriaa/ytdl', testNechlophomeriaaYtdl);
    await testLibrary('btch-downloader', testBtchDownloader);
    
    console.log('\n🎯 Test Summary:');
    console.log('✅ Libraries tested with correct APIs');
    console.log('✅ Quality options explored');
    console.log('✅ Format availability checked');
    console.log('\n💡 Next steps: Identify best library for quality selection');
}

// Run the tests
runAllTests().catch(console.error);
