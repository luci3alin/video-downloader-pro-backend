// Test different import methods for each library
const vredenScraper = require('@vreden/youtube_scraper');
const bochilTeam = require('@bochilteam/scraper-youtube');
const darkYasiya = require('@dark-yasiya/scrap');

const testUrl = 'https://www.youtube.com/watch?v=Kq6z4bs3W84';

console.log('🧪 === TESTING NEW YOUTUBE DOWNLOAD LIBRARIES ===\n');

// Test 1: @vreden/youtube_scraper
async function testVredenScraper() {
    console.log('🔍 Testing @vreden/youtube_scraper...');
    console.log('📦 Module structure:', Object.keys(vredenScraper));
    
    try {
        // Use ytmp4 for video download with quality
        console.log('🎯 Testing ytmp4 function...');
        const result = await vredenScraper.ytmp4(testUrl);
        
        console.log('✅ SUCCESS: @vreden/youtube_scraper.ytmp4');
        console.log('📊 Result structure:', Object.keys(result));
        console.log('📺 Title:', result.title || 'N/A');
        console.log('👤 Author:', result.author || 'N/A');
        
        // Check for quality options
        if (result.qualities) {
            console.log('🎯 Available qualities:', result.qualities);
        }
        if (result.formats) {
            console.log('📁 Available formats:', result.formats);
        }
        
        console.log('📝 Full result:', JSON.stringify(result, null, 2));
        console.log('');
        
    } catch (error) {
        console.log('❌ FAILED: @vreden/youtube_scraper.ytmp4');
        console.log('💥 Error:', error.message);
        console.log('');
    }
}

// Test 2: @bochilteam/scraper-youtube
async function testBochilTeam() {
    console.log('🔍 Testing @bochilteam/scraper-youtube...');
    console.log('📦 Module structure:', Object.keys(bochilTeam));
    
    try {
        // Use youtubedl function
        console.log('🎯 Testing youtubedl function...');
        const result = await bochilTeam.youtubedl(testUrl);
        
        console.log('✅ SUCCESS: @bochilteam/scraper-youtube.youtubedl');
        console.log('📊 Result structure:', Object.keys(result));
        console.log('📺 Title:', result.title || 'N/A');
        console.log('👤 Author:', result.author || 'N/A');
        
        // Check for quality options
        if (result.qualities) {
            console.log('🎯 Available qualities:', result.qualities);
        }
        if (result.formats) {
            console.log('📁 Available formats:', result.formats);
        }
        
        console.log('📝 Full result:', JSON.stringify(result, null, 2));
        console.log('');
        
    } catch (error) {
        console.log('❌ FAILED: @bochilteam/scraper-youtube.youtubedl');
        console.log('💥 Error:', error.message);
        console.log('');
    }
}

// Test 3: @dark-yasiya/scrap
async function testDarkYasiya() {
    console.log('🔍 Testing @dark-yasiya/scrap...');
    console.log('📦 Module structure:', Object.keys(darkYasiya));
    
    try {
        // Use the class constructor
        console.log('🎯 Testing DY_SCRAP class...');
        const scraper = new darkYasiya.DY_SCRAP();
        const result = await scraper.youtube(testUrl);
        
        console.log('✅ SUCCESS: @dark-yasiya/scrap.DY_SCRAP.youtube');
        console.log('📊 Result structure:', Object.keys(result));
        console.log('📺 Title:', result.title || 'N/A');
        console.log('👤 Author:', result.author || 'N/A');
        
        // Check for quality options
        if (result.qualities) {
            console.log('🎯 Available qualities:', result.qualities);
        }
        if (result.formats) {
            console.log('📁 Available formats:', result.formats);
        }
        
        console.log('📝 Full result:', JSON.stringify(result, null, 2));
        console.log('');
        
    } catch (error) {
        console.log('❌ FAILED: @dark-yasiya/scrap.DY_SCRAP.youtube');
        console.log('💥 Error:', error.message);
        console.log('');
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting tests for:', testUrl);
    console.log('⏰ Test started at:', new Date().toLocaleTimeString());
    console.log('');
    
    await testVredenScraper();
    await testBochilTeam();
    await testDarkYasiya();
    
    console.log('🏁 All tests completed!');
    console.log('⏰ Test finished at:', new Date().toLocaleTimeString());
}

// Run tests
runAllTests().catch(console.error);
