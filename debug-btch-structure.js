const btchDownloader = require('btch-downloader');

console.log('🔍 Debugging btch-downloader structure');
console.log('=====================================\n');

async function debugStructure() {
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    try {
        const result = await btchDownloader.youtube(testUrl);
        
        console.log('📊 Full result structure:');
        console.log(JSON.stringify(result, null, 2));
        
        console.log('\n🔍 Detailed analysis:');
        
        if (result.mp3) {
            console.log('\n🎵 MP3 structure:');
            console.log('Type:', typeof result.mp3);
            console.log('Is Array:', Array.isArray(result.mp3));
            console.log('Length:', result.mp3 ? result.mp3.length : 'N/A');
            
            if (Array.isArray(result.mp3)) {
                result.mp3.forEach((mp3, idx) => {
                    console.log(`\nMP3 Option ${idx + 1}:`);
                    console.log('Keys:', Object.keys(mp3));
                    console.log('Full object:', mp3);
                });
            }
        }
        
        if (result.mp4) {
            console.log('\n📹 MP4 structure:');
            console.log('Type:', typeof result.mp4);
            console.log('Is Array:', Array.isArray(result.mp4));
            console.log('Length:', result.mp4 ? result.mp4.length : 'N/A');
            
            if (Array.isArray(result.mp4)) {
                result.mp4.forEach((mp4, idx) => {
                    console.log(`\nMP4 Option ${idx + 1}:`);
                    console.log('Keys:', Object.keys(mp4));
                    console.log('Full object:', mp4);
                });
            }
        }
        
        // Check for other possible download properties
        console.log('\n🔍 Looking for download properties:');
        const allKeys = Object.keys(result);
        allKeys.forEach(key => {
            const value = result[key];
            if (typeof value === 'string' && value.includes('http')) {
                console.log(`✅ Found URL in ${key}:`, value.substring(0, 100) + '...');
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugStructure();
