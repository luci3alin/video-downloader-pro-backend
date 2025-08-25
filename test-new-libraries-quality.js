// Test script for new YouTube download libraries with quality selection
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 Testing New YouTube Download Libraries with Quality Selection');
console.log('==============================================================');
console.log('🎯 Focus: Quality selection, format support, and anti-bot detection');
console.log('⚠️ Skipping @vreden/youtube_scraper (Cloudflare issues)');
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

// Test 1: @dark-yasiya/scrap
async function testDarkYasiyaScrap() {
    try {
        const { youtube } = require('@dark-yasiya/scrap');
        
        console.log('📊 Getting video info...');
        const info = await youtube(TEST_URL);
        
        console.log('📹 Video Title:', info.title);
        console.log('⏱️ Duration:', info.duration);
        
        // Check available formats
        if (info.formats) {
            console.log('\n🎬 Available Formats:');
            info.formats.forEach((format, index) => {
                console.log(`  ${index + 1}. ${format.quality || 'Unknown'} - ${format.url ? '✅' : '❌'} URL`);
            });
        }
        
        // Check if we can get quality options
        if (info.qualities) {
            console.log('\n🎯 Available Qualities:');
            info.qualities.forEach(quality => {
                console.log(`  • ${quality}`);
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

// Test 2: yt-streamer
async function testYtStreamer() {
    try {
        const ytStreamer = require('yt-streamer');
        
        console.log('📊 Getting video info...');
        console.log('🔍 Available methods:', Object.keys(ytStreamer));
        
        // Try different possible method names
        let info;
        if (typeof ytStreamer === 'function') {
            info = await ytStreamer(TEST_URL);
        } else if (ytStreamer.getInfo) {
            info = await ytStreamer.getInfo(TEST_URL);
        } else if (ytStreamer.info) {
            info = await ytStreamer.info(TEST_URL);
        } else {
            throw new Error('No suitable method found for getting video info');
        }
        
        console.log('📹 Video Title:', info.title || 'Unknown');
        console.log('⏱️ Duration:', info.duration || 'Unknown');
        
        // Check available formats
        if (info.formats) {
            console.log('\n🎬 Available Formats:');
            info.formats.forEach((format, index) => {
                console.log(`  ${index + 1}. ${format.quality || 'Unknown'} - ${format.url ? '✅' : '❌'} URL`);
            });
        }
        
        // Check if we can get quality options
        if (info.qualities) {
            console.log('\n🎯 Available Qualities:');
            info.qualities.forEach(quality => {
                console.log(`  • ${quality}`);
            });
        }
        
        return true;
    } catch (error) {
        throw new Error(`yt-streamer failed: ${error.message}`);
    }
}

// Test 3: btch-downloader (already working, but let's check for quality options)
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

// Test 4: @bochilteam/scraper-youtube (check correct API)
async function testBochilTeamScraper() {
    try {
        const scraper = require('@bochilteam/scraper-youtube');
        
        console.log('📊 Getting video info...');
        console.log('🔍 Available methods:', Object.keys(scraper));
        
        // Try to find the correct method
        let info;
        if (scraper.youtube) {
            info = await scraper.youtube(TEST_URL);
        } else if (scraper.getInfo) {
            info = await scraper.getInfo(TEST_URL);
        } else if (typeof scraper === 'function') {
            info = await scraper(TEST_URL);
        } else {
            throw new Error('No suitable method found for getting video info');
        }
        
        console.log('📹 Video Title:', info.title || 'Unknown');
        console.log('⏱️ Duration:', info.duration || 'Unknown');
        
        // Check available formats
        if (info.formats) {
            console.log('\n🎬 Available Formats:');
            info.formats.forEach((format, index) => {
                console.log(`  ${index + 1}. ${format.quality || 'Unknown'} - ${format.url ? '✅' : '❌'} URL`);
            });
        }
        
        return true;
    } catch (error) {
        throw new Error(`bochilteam scraper failed: ${error.message}`);
    }
}

// Test 5: @nechlophomeriaa/ytdl (check correct API)
async function testNechlophomeriaaYtdl() {
    try {
        const ytdl = require('@nechlophomeriaa/ytdl');
        
        console.log('📊 Getting video info...');
        console.log('🔍 Available methods:', Object.keys(ytdl));
        
        // Try to find the correct method
        let info;
        if (ytdl.getInfo) {
            info = await ytdl.getInfo(TEST_URL);
        } else if (ytdl.info) {
            info = await ytdl.info(TEST_URL);
        } else if (typeof ytdl === 'function') {
            info = await ytdl(TEST_URL);
        } else {
            throw new Error('No suitable method found for getting video info');
        }
        
        console.log('📹 Video Title:', info.videoDetails?.title || info.title || 'Unknown');
        console.log('⏱️ Duration:', info.videoDetails?.lengthSeconds || info.duration || 'Unknown');
        
        // Check available formats
        if (info.formats) {
            console.log('\n🎬 Available Formats:');
            info.formats.forEach((format, index) => {
                console.log(`  ${index + 1}. ${format.qualityLabel || format.quality || 'Unknown'} - ${format.url ? '✅' : '❌'} URL`);
            });
        }
        
        return true;
    } catch (error) {
        throw new Error(`nechlophomeriaa ytdl failed: ${error.message}`);
    }
}

// Main test function
async function runAllTests() {
    console.log('🚀 Starting comprehensive library testing...\n');
    
    // Test new libraries first
    await testLibrary('@dark-yasiya/scrap', testDarkYasiyaScrap);
    await testLibrary('yt-streamer', testYtStreamer);
    
    // Test existing libraries with corrected APIs
    await testLibrary('@bochilteam/scraper-youtube', testBochilTeamScraper);
    await testLibrary('@nechlophomeriaa/ytdl', testNechlophomeriaaYtdl);
    await testLibrary('btch-downloader', testBtchDownloader);
    
    console.log('\n🎯 Test Summary:');
    console.log('✅ Libraries tested for quality selection capabilities');
    console.log('✅ Format availability checked');
    console.log('✅ URL availability verified');
    console.log('\n💡 Next steps: Identify libraries with quality selection and integrate them');
}

// Run the tests
runAllTests().catch(console.error);
