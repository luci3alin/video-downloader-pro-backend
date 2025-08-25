const btchDownloader = require('btch-downloader');

async function investigateBtchDownloader() {
    try {
        console.log('🔍 === THOROUGH INVESTIGATION OF BTCHDOWNLOADER ===');
        
        // Check all exports
        console.log('\n📦 ALL EXPORTS:');
        console.log(Object.keys(btchDownloader));
        
        // Check if btchDownloader is a function or object
        console.log('\n🔍 BTCHDOWNLOADER TYPE:', typeof btchDownloader);
        
        if (typeof btchDownloader === 'object') {
            console.log('\n🔍 ALL PROPERTIES AND METHODS:');
            Object.keys(btchDownloader).forEach(key => {
                const value = btchDownloader[key];
                console.log(`  ${key}: ${typeof value} ${Array.isArray(value) ? `(array with ${value.length} items)` : ''}`);
                
                // If it's a function, check if it has properties
                if (typeof value === 'function' && value !== btchDownloader.youtube) {
                    console.log(`    Function properties:`, Object.keys(value));
                }
            });
        }
        
        // Test the youtube method with different parameters
        console.log('\n🔍 TESTING YOUTUBE METHOD WITH DIFFERENT PARAMETERS:');
        const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        
        // Test 1: Basic call
        console.log('\n📝 TEST 1: Basic youtube() call');
        try {
            const result1 = await btchDownloader.youtube(testUrl);
            console.log('✅ Basic call succeeded');
            console.log('📊 Result keys:', Object.keys(result1));
        } catch (error) {
            console.log('❌ Basic call failed:', error.message);
        }
        
        // Test 2: Try with quality parameter
        console.log('\n📝 TEST 2: youtube() with quality parameter');
        try {
            const result2 = await btchDownloader.youtube(testUrl, { quality: '720p' });
            console.log('✅ Quality parameter call succeeded');
            console.log('📊 Result keys:', Object.keys(result2));
            console.log('🔍 Checking for quality differences...');
            
            if (result2.mp4 && result2.mp4 !== 'https://rr4---sn-4g5e6nzl.googlevideo.com/videoplayback?expire=1756107732&ei=dL-raLKCAYaCp-oPjsv1-Aw&ip=104.28.207.220&id=o-ADL57Xf-F09kvyjpG_pMRhZIWULf2Du-hNQH-YOQNPmk&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1756086132%2C&mh=7c&mm=31%2C29&mn=sn-4g5e6nzl%2Csn-4g5ednsl&ms=au%2Crdu&mv=m&mvi=4&pl=24&rms=au%2Cau&ctier=A&pfa=5&initcwndbps=3210000&hightc=yes&siu=1&bui=AY1jyLPl_4HGeeC3sJdFllFBBxwkO3OU54QsiDHAUGaMlhjf_xqqMYLrDuhUgiHWz50r-uwF4w&spc=l3OVKaxTPaZ0f3uvBgvFaobfDa2cvQtHLjaAVNnt_9BdHwX7wdqI2ddsGyUP81jJX61qFCPW-bi7pJFRZ4lU4o5wQZkqdzjI&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&cnr=14&ratebypass=yes&dur=213.089&lmt=1749083304269135&mt=1756085608&fvip=3&fexp=51552689%2C51565115%2C51565681%2C51580968&txp=4538534&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cctier%2Cpfa%2Chightc%2Csiu%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRQIhAIqgHBgkPuznUws6mulRAjB_o8PgAg--OWQNx5EYthEcAiAgM7UY8j016pytES7EZB14-7PBr-_mScXanH0sv3i04Q%3D%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRgIhAIh_tLc3eC76OAo3oM6dSos29PaIJh_LTMJWBapGnudSAiEA-8fW7WM99U7IvN_1ePcAG7LwCisMadfk6K4Xo4Da72Q%3D') {
                console.log('🎉 DIFFERENT URL FOUND! Quality parameter might work!');
                console.log('🔗 New URL:', result2.mp4.substring(0, 100) + '...');
            } else {
                console.log('⚠️ Same URL - quality parameter might not be supported');
            }
        } catch (error) {
            console.log('❌ Quality parameter call failed:', error.message);
        }
        
        // Test 3: Try with format parameter
        console.log('\n📝 TEST 3: youtube() with format parameter');
        try {
            const result3 = await btchDownloader.youtube(testUrl, { format: 'mp4' });
            console.log('✅ Format parameter call succeeded');
            console.log('📊 Result keys:', Object.keys(result3));
        } catch (error) {
            console.log('❌ Format parameter call failed:', error.message);
        }
        
        // Test 4: Try with resolution parameter
        console.log('\n📝 TEST 4: youtube() with resolution parameter');
        try {
            const result4 = await btchDownloader.youtube(testUrl, { resolution: '720p' });
            console.log('✅ Resolution parameter call succeeded');
            console.log('📊 Result keys:', Object.keys(result4));
        } catch (error) {
            console.log('❌ Resolution parameter call failed:', error.message);
        }
        
        // Test 5: Try with itag parameter
        console.log('\n📝 TEST 5: youtube() with itag parameter');
        try {
            const result5 = await btchDownloader.youtube(testUrl, { itag: '22' }); // 720p itag
            console.log('✅ Itag parameter call succeeded');
            console.log('📊 Result keys:', Object.keys(result5));
        } catch (error) {
            console.log('❌ Itag parameter call failed:', error.message);
        }
        
        // Test 6: Check if there are other methods that might provide quality options
        console.log('\n🔍 TEST 6: Checking for other methods that might provide quality info');
        
        // Check if there's a method to get video info
        if (typeof btchDownloader.getInfo === 'function') {
            console.log('✅ getInfo method found');
            try {
                const info = await btchDownloader.getInfo(testUrl);
                console.log('📊 Info result keys:', Object.keys(info));
            } catch (error) {
                console.log('❌ getInfo failed:', error.message);
            }
        }
        
        // Check if there's a method to get formats
        if (typeof btchDownloader.getFormats === 'function') {
            console.log('✅ getFormats method found');
            try {
                const formats = await btchDownloader.getFormats(testUrl);
                console.log('📊 Formats result keys:', Object.keys(formats));
            } catch (error) {
                console.log('❌ getFormats failed:', error.message);
            }
        }
        
        // Check if there's a method to get streams
        if (typeof btchDownloader.getStreams === 'function') {
            console.log('✅ getStreams method found');
            try {
                const streams = await btchDownloader.getStreams(testUrl);
                console.log('📊 Streams result keys:', Object.keys(streams));
            } catch (error) {
                console.log('❌ getStreams failed:', error.message);
            }
        }
        
        // Check if there's a method to get qualities
        if (typeof btchDownloader.getQualities === 'function') {
            console.log('✅ getQualities method found');
            try {
                const qualities = await btchDownloader.getQualities(testUrl);
                console.log('📊 Qualities result keys:', Object.keys(qualities));
            } catch (error) {
                console.log('❌ getQualities failed:', error.message);
            }
        }
        
        console.log('\n🔍 INVESTIGATION COMPLETE');
        
    } catch (error) {
        console.error('❌ Error in investigation:', error);
    }
}

investigateBtchDownloader();
