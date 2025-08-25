// Detailed test script for btch-downloader to explore quality options
const { youtube } = require('btch-downloader');

console.log('🔍 Detailed btch-downloader Test');
console.log('================================');
console.log('🎯 Exploring quality options and format data');
console.log('');

async function testBtchDownloaderDetailed() {
    try {
        const TEST_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll
        
        console.log('📊 Getting video info...');
        const info = await youtube(TEST_URL);
        
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
        
        // Look for quality-related properties
        console.log('\n🎯 Quality-Related Properties:');
        const qualityKeys = Object.keys(info).filter(key => 
            key.toLowerCase().includes('quality') || 
            key.toLowerCase().includes('format') || 
            key.toLowerCase().includes('resolution') ||
            key.toLowerCase().includes('size')
        );
        
        if (qualityKeys.length > 0) {
            qualityKeys.forEach(key => {
                console.log(`  ✅ ${key}: ${JSON.stringify(info[key])}`);
            });
        } else {
            console.log('  ❌ No quality-related properties found');
        }
        
        // Check if there are download URLs
        console.log('\n🔗 Download URL Properties:');
        const urlKeys = Object.keys(info).filter(key => 
            key.toLowerCase().includes('url') || 
            key.toLowerCase().includes('link') || 
            key.toLowerCase().includes('download')
        );
        
        if (urlKeys.length > 0) {
            urlKeys.forEach(key => {
                console.log(`  ✅ ${key}: ${info[key] ? 'Has URL' : 'No URL'}`);
            });
        } else {
            console.log('  ❌ No download URL properties found');
        }
        
        console.log('\n🎬 Testing different video URLs...');
        
        // Test with different video types
        const testUrls = [
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Short video
            'https://www.youtube.com/watch?v=9bZkp7q19f0', // PSY - Gangnam Style
            'https://www.youtube.com/watch?v=kJQP7kiw5Fk'  // Luis Fonsi - Despacito
        ];
        
        for (let i = 0; i < Math.min(testUrls.length, 2); i++) {
            try {
                console.log(`\n🔍 Testing URL ${i + 1}: ${testUrls[i]}`);
                const testInfo = await youtube(testUrls[i]);
                
                if (testInfo && testInfo.title) {
                    console.log(`  📹 Title: ${testInfo.title}`);
                    
                    // Check for quality options
                    if (testInfo.quality || testInfo.qualities || testInfo.formats) {
                        console.log(`  🎯 Quality options found:`, {
                            quality: testInfo.quality,
                            qualities: testInfo.qualities,
                            formats: testInfo.formats
                        });
                    }
                }
            } catch (error) {
                console.log(`  ❌ Failed: ${error.message}`);
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Detailed test failed:', error);
        throw error;
    }
}

// Run the detailed test
testBtchDownloaderDetailed().catch(console.error);
