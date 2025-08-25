const { spawn } = require('child_process');

async function testPythonIntegration() {
    console.log('🧪 Testing Python pytubefix integration...');
    
    // Test URL
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    try {
        // Test getting qualities
        console.log('🔄 Testing quality detection...');
        const qualitiesProcess = spawn('python3', ['youtube_quality.py', testUrl, '--action', 'qualities']);
        
        let qualitiesData = '';
        let qualitiesError = '';
        
        qualitiesProcess.stdout.on('data', (data) => {
            qualitiesData += data.toString();
        });
        
        qualitiesProcess.stderr.on('data', (data) => {
            qualitiesError += data.toString();
        });
        
        const qualitiesResult = await new Promise((resolve, reject) => {
            qualitiesProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        const parsed = JSON.parse(qualitiesData);
                        resolve(parsed);
                    } catch (parseError) {
                        reject(new Error(`Failed to parse Python output: ${parseError.message}`));
                    }
                } else {
                    reject(new Error(`Python process failed with code ${code}: ${qualitiesError}`));
                }
            });
        });
        
        if (qualitiesResult.error) {
            throw new Error(`Python pytubefix error: ${qualitiesResult.error}`);
        }
        
        console.log('✅ Successfully got qualities from Python pytubefix');
        console.log('📊 Available qualities:', qualitiesResult.qualities.length);
        console.log('🎬 Video title:', qualitiesResult.title);
        console.log('👤 Author:', qualitiesResult.author);
        
        // Show first few qualities
        console.log('📺 First 5 qualities:');
        qualitiesResult.qualities.slice(0, 5).forEach((q, i) => {
            console.log(`  ${i + 1}. ${q.resolution} (${q.type}) - ${q.mime_type}`);
        });
        
        // Test download (small quality for testing)
        if (qualitiesResult.qualities.length > 0) {
            const testQuality = qualitiesResult.qualities[0].resolution;
            console.log(`🔄 Testing download with quality: ${testQuality}`);
            
            const downloadProcess = spawn('python3', ['youtube_quality.py', testUrl, '--action', 'download', '--quality', testQuality]);
            
            let downloadData = '';
            let downloadError = '';
            
            downloadProcess.stdout.on('data', (data) => {
                downloadData += data.toString();
            });
            
            downloadProcess.stderr.on('data', (data) => {
                downloadError += data.toString();
            });
            
            const downloadResult = await new Promise((resolve, reject) => {
                downloadProcess.on('close', (code) => {
                    if (code === 0) {
                        try {
                            const parsed = JSON.parse(downloadData);
                            resolve(parsed);
                        } catch (parseError) {
                            reject(new Error(`Failed to parse Python download output: ${parseError.message}`));
                        }
                    } else {
                        reject(new Error(`Python download process failed with code ${code}: ${downloadError}`));
                    }
                });
            });
            
            if (downloadResult.error) {
                console.log('⚠️ Download test failed:', downloadResult.error);
            } else {
                console.log('✅ Download test successful!');
                console.log('📁 File path:', downloadResult.file_path);
                console.log('🎯 Quality:', downloadResult.quality);
                console.log('📏 File size:', downloadResult.filesize);
            }
        }
        
    } catch (error) {
        console.error('❌ Error in Python integration test:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testPythonIntegration();
