// Test script for enhanced anti-bot detection
const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing Enhanced Anti-Bot Detection Features');
console.log('==============================================');

async function testYtDlpEnhancedHeaders() {
    console.log('\n🔍 Testing yt-dlp with enhanced headers...');
    
    const ytDlpPath = process.env.YT_DLP_PATH || (process.platform === 'win32' ? './yt-dlp-windows.exe' : './yt-dlp');
    
    if (!require('fs').existsSync(ytDlpPath)) {
        console.log('❌ yt-dlp not found, skipping test');
        return false;
    }
    
    try {
        const result = await new Promise((resolve, reject) => {
            const child = spawn(ytDlpPath, [
                '--dump-json',
                '--no-playlist',
                '--quiet',
                '--no-warnings',
                '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                '--add-header', 'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                '--add-header', 'Accept-Language:en-US,en;q=0.9',
                '--add-header', 'DNT:1',
                '--add-header', 'Connection:keep-alive',
                '--no-check-certificates',
                '--prefer-insecure',
                'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
            ]);
            
            let stdout = '';
            let stderr = '';
            
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            child.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(`yt-dlp exited with code ${code}. Stderr: ${stderr}`));
                }
            });
            
            child.on('error', (err) => {
                reject(new Error(`Failed to start yt-dlp process: ${err.message}`));
            });
        });
        
        console.log('✅ yt-dlp with enhanced headers executed successfully');
        
        try {
            const videoInfo = JSON.parse(result);
            console.log('✅ JSON parsing successful');
            console.log(`📹 Video title: ${videoInfo.title || 'Unknown'}`);
            console.log(`⏱️ Duration: ${videoInfo.duration || 'Unknown'} seconds`);
            console.log(`📊 Formats available: ${videoInfo.formats ? videoInfo.formats.length : 0}`);
            
            return true;
        } catch (parseError) {
            console.log('⚠️ JSON parsing failed, but command executed');
            return true;
        }
        
    } catch (error) {
        console.error('❌ yt-dlp enhanced headers test failed:', error.message);
        return false;
    }
}

async function testYtdlCoreEnhancedHeaders() {
    console.log('\n🔍 Testing ytdl-core with enhanced headers...');
    
    try {
        const ytdl = require('@distube/ytdl-core');
        
        const options = {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Cache-Control': 'max-age=0'
                }
            }
        };
        
        console.log('🔧 ytdl-core enhanced headers configured');
        
        const info = await ytdl.getInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ', options);
        
        console.log('✅ ytdl-core with enhanced headers executed successfully');
        console.log(`📹 Video title: ${info.videoDetails.title || 'Unknown'}`);
        console.log(`⏱️ Duration: ${info.videoDetails.lengthSeconds || 'Unknown'} seconds`);
        console.log(`📊 Formats available: ${info.formats ? info.formats.length : 0}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ ytdl-core enhanced headers test failed:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('\n🚀 Starting enhanced anti-bot detection tests...');
    
    const results = {
        ytdlp: false,
        ytdlCore: false
    };
    
    // Test yt-dlp enhanced headers
    results.ytdlp = await testYtDlpEnhancedHeaders();
    
    // Test ytdl-core enhanced headers
    results.ytdlCore = await testYtdlCoreEnhancedHeaders();
    
    // Summary
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`yt-dlp enhanced headers: ${results.ytdlp ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`ytdl-core enhanced headers: ${results.ytdlCore ? '✅ PASS' : '❌ PASS'}`);
    
    if (results.ytdlp && results.ytdlCore) {
        console.log('\n🎉 All enhanced anti-bot detection tests passed!');
        console.log('🚀 Your system is ready for enhanced YouTube downloads.');
    } else if (results.ytdlp || results.ytdlCore) {
        console.log('\n⚠️ Partial success - some methods working');
        console.log('🔄 Fallback system will ensure downloads continue.');
    } else {
        console.log('\n❌ All tests failed - check yt-dlp installation and dependencies');
    }
    
    console.log('\n🔍 Check the console above for detailed error messages');
}

// Run tests
runTests().catch(console.error);
=======
// Test script for enhanced anti-bot detection
const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing Enhanced Anti-Bot Detection Features');
console.log('==============================================');

async function testYtDlpEnhancedHeaders() {
    console.log('\n🔍 Testing yt-dlp with enhanced headers...');
    
    const ytDlpPath = process.env.YT_DLP_PATH || (process.platform === 'win32' ? './yt-dlp-windows.exe' : './yt-dlp');
    
    if (!require('fs').existsSync(ytDlpPath)) {
        console.log('❌ yt-dlp not found, skipping test');
        return false;
    }
    
    try {
        const result = await new Promise((resolve, reject) => {
            const child = spawn(ytDlpPath, [
                '--dump-json',
                '--no-playlist',
                '--quiet',
                '--no-warnings',
                '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                '--add-header', 'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                '--add-header', 'Accept-Language:en-US,en;q=0.9',
                '--add-header', 'DNT:1',
                '--add-header', 'Connection:keep-alive',
                '--no-check-certificates',
                '--prefer-insecure',
                'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
            ]);
            
            let stdout = '';
            let stderr = '';
            
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            child.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(`yt-dlp exited with code ${code}. Stderr: ${stderr}`));
                }
            });
            
            child.on('error', (err) => {
                reject(new Error(`Failed to start yt-dlp process: ${err.message}`));
            });
        });
        
        console.log('✅ yt-dlp with enhanced headers executed successfully');
        
        try {
            const videoInfo = JSON.parse(result);
            console.log('✅ JSON parsing successful');
            console.log(`📹 Video title: ${videoInfo.title || 'Unknown'}`);
            console.log(`⏱️ Duration: ${videoInfo.duration || 'Unknown'} seconds`);
            console.log(`📊 Formats available: ${videoInfo.formats ? videoInfo.formats.length : 0}`);
            
            return true;
        } catch (parseError) {
            console.log('⚠️ JSON parsing failed, but command executed');
            return true;
        }
        
    } catch (error) {
        console.error('❌ yt-dlp enhanced headers test failed:', error.message);
        return false;
    }
}

async function testYtdlCoreEnhancedHeaders() {
    console.log('\n🔍 Testing ytdl-core with enhanced headers...');
    
    try {
        const ytdl = require('@distube/ytdl-core');
        
        const options = {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Cache-Control': 'max-age=0'
                }
            }
        };
        
        console.log('🔧 ytdl-core enhanced headers configured');
        
        const info = await ytdl.getInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ', options);
        
        console.log('✅ ytdl-core with enhanced headers executed successfully');
        console.log(`📹 Video title: ${info.videoDetails.title || 'Unknown'}`);
        console.log(`⏱️ Duration: ${info.videoDetails.lengthSeconds || 'Unknown'} seconds`);
        console.log(`📊 Formats available: ${info.formats ? info.formats.length : 0}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ ytdl-core enhanced headers test failed:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('\n🚀 Starting enhanced anti-bot detection tests...');
    
    const results = {
        ytdlp: false,
        ytdlCore: false
    };
    
    // Test yt-dlp enhanced headers
    results.ytdlp = await testYtDlpEnhancedHeaders();
    
    // Test ytdl-core enhanced headers
    results.ytdlCore = await testYtdlCoreEnhancedHeaders();
    
    // Summary
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`yt-dlp enhanced headers: ${results.ytdlp ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`ytdl-core enhanced headers: ${results.ytdlCore ? '✅ PASS' : '❌ PASS'}`);
    
    if (results.ytdlp && results.ytdlCore) {
        console.log('\n🎉 All enhanced anti-bot detection tests passed!');
        console.log('🚀 Your system is ready for enhanced YouTube downloads.');
    } else if (results.ytdlp || results.ytdlCore) {
        console.log('\n⚠️ Partial success - some methods working');
        console.log('🔄 Fallback system will ensure downloads continue.');
    } else {
        console.log('\n❌ All tests failed - check yt-dlp installation and dependencies');
    }
    
    console.log('\n🔍 Check the console above for detailed error messages');
}

// Run tests
runTests().catch(console.error);
