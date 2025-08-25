const vredenScraper = require('@vreden/youtube_scraper');
const bochilScraper = require('@bochilteam/scraper-youtube');
const DarkYasiyaScrap = require('@dark-yasiya/scrap');

async function testAlternatives() {
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll for testing
    
    console.log('🧪 Testing alternative YouTube download libraries...\n');
    
    // Test 1: @vreden/youtube_scraper - ✅ WORKING!
    try {
        console.log('🥇 Testing @vreden/youtube_scraper...');
        console.log('Available functions:', Object.keys(vredenScraper));
        
        // Test ytmp4 function
        const result1 = await vredenScraper.ytmp4(testUrl);
        console.log('✅ SUCCESS ytmp4:', result1.status ? 'WORKING' : 'FAILED');
        if (result1.status) {
            console.log('   - Quality:', result1.download.quality);
            console.log('   - Available qualities:', result1.download.availableQuality);
            console.log('   - Download URL:', result1.download.url ? 'YES' : 'NO');
        }
        
        // Test ytmp3 function
        const result1Audio = await vredenScraper.ytmp3(testUrl);
        console.log('✅ SUCCESS ytmp3:', result1Audio.status ? 'WORKING' : 'FAILED');
        if (result1Audio.status) {
            console.log('   - Quality:', result1Audio.download.quality);
            console.log('   - Available qualities:', result1Audio.download.availableQuality);
            console.log('   - Download URL:', result1Audio.download.url ? 'YES' : 'NO');
        }
        
    } catch (error) {
        console.log('❌ FAILED:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: @bochilteam/scraper-youtube
    try {
        console.log('🥈 Testing @bochilteam/scraper-youtube...');
        console.log('Available functions:', Object.keys(bochilScraper));
        
        // Try with a different approach
        const result2 = await bochilScraper.youtubedlv2(testUrl);
        console.log('✅ SUCCESS youtubedlv2:', result2 ? 'WORKING' : 'FAILED');
        if (result2) {
            console.log('   - Result type:', typeof result2);
            console.log('   - Has links:', result2.links ? 'YES' : 'NO');
        }
        
    } catch (error) {
        console.log('❌ FAILED:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: @dark-yasiya/scrap
    try {
        console.log('🥉 Testing @dark-yasiya/scrap...');
        
        const darkYasiya = new DarkYasiyaScrap();
        console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(darkYasiya)).filter(m => !m.startsWith('_')));
        
        // Test ytmp4 function
        const result3 = await darkYasiya.ytmp4(testUrl);
        console.log('✅ SUCCESS ytmp4:', result3 ? 'WORKING' : 'FAILED');
        if (result3) {
            console.log('   - Result type:', typeof result3);
            console.log('   - Has data:', result3.data ? 'YES' : 'NO');
        }
        
    } catch (error) {
        console.log('❌ FAILED:', error.message);
    }
}

testAlternatives().catch(console.error);
