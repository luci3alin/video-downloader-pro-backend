const { spawn } = require('child_process');
const path = require('path');

async function testYtDlp() {
    try {
        console.log('Testing yt-dlp...');
        
        // Test with different paths
        const paths = [
            'yt-dlp',
            './yt-dlp',
            './yt-dlp.exe',
            path.join(__dirname, 'yt-dlp.exe'),
            './yt-dlp-windows.exe',
            path.join(__dirname, 'yt-dlp-windows.exe'),
            process.env.YT_DLP_PATH || (process.platform === 'win32' ? './yt-dlp-windows.exe' : './yt-dlp')
        ];
        
        for (const ytDlpPath of paths) {
            try {
                console.log(`\nTrying path: ${ytDlpPath}`);
                
                // Test with child_process directly
                const result = await new Promise((resolve, reject) => {
                    const process = spawn(ytDlpPath, [
                        '--dump-json',
                        '--no-playlist',
                        '--quiet',
                        'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                    ]);
                    
                    let stdout = '';
                    let stderr = '';
                    
                    process.stdout.on('data', (data) => {
                        stdout += data.toString();
                    });
                    
                    process.stderr.on('data', (data) => {
                        stderr += data.toString();
                    });
                    
                    process.on('close', (code) => {
                        if (code === 0) {
                            resolve({ stdout, stderr });
                        } else {
                            reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}`));
                        }
                    });
                    
                    process.on('error', (error) => {
                        reject(error);
                    });
                });
                
                console.log(`✅ SUCCESS with path: ${ytDlpPath}`);
                console.log(`Output length: ${result.stdout.length} characters`);
                console.log(`First 200 chars: ${result.stdout.substring(0, 200)}...`);
                return; // Success, exit
                
            } catch (error) {
                console.log(`❌ FAILED with path: ${ytDlpPath}`);
                console.log(`Error: ${error.message}`);
            }
        }
        
        console.log('\n❌ All yt-dlp paths failed');
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testYtDlp();
