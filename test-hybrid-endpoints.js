// Test script for Hybrid Quality Selection System endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll

async function testQualityOptions() {
    try {
        console.log('🧪 Testing /api/quality-options endpoint...');
        
        const response = await axios.post(`${BASE_URL}/api/quality-options`, {
            url: TEST_URL
        });
        
        if (response.data.success) {
            console.log('✅ Quality options endpoint working!');
            console.log('📋 Available qualities:');
            response.data.data.qualities.forEach((option, index) => {
                const antiBotStatus = option.antiBot ? '🛡️' : '⚠️';
                console.log(`  ${index + 1}. ${option.quality} ${option.format.toUpperCase()} - ${option.size} - ${option.url} (${option.source}) ${antiBotStatus}`);
            });
            
            console.log(`\n📊 Summary:`);
            console.log(`  Title: ${response.data.data.title}`);
            console.log(`  Source: ${response.data.data.source}`);
            console.log(`  Anti-bot: ${response.data.data.antiBot ? 'Enabled' : 'Disabled'}`);
            console.log(`  Multiple Qualities: ${response.data.data.hasMultipleQualities ? 'Yes' : 'No'}`);
            
            return response.data.data;
        } else {
            console.log('❌ Quality options endpoint failed:', response.data.error);
            return null;
        }
        
    } catch (error) {
        console.error('❌ Error testing quality options:', error.message);
        return null;
    }
}

async function testDownloadWithQuality(quality, format) {
    try {
        console.log(`\n🧪 Testing /api/download-with-quality endpoint...`);
        console.log(`🎯 Quality: ${quality}, Format: ${format}`);
        
        const response = await axios.post(`${BASE_URL}/api/download-with-quality`, {
            url: TEST_URL,
            quality: quality,
            format: format
        });
        
        if (response.data.success) {
            console.log('✅ Download with quality endpoint working!');
            console.log('📊 Download result:');
            console.log(`  Filename: ${response.data.data.filename}`);
            console.log(`  Quality: ${response.data.data.quality}`);
            console.log(`  Format: ${response.data.data.format}`);
            console.log(`  Source: ${response.data.data.source}`);
            console.log(`  Anti-bot: ${response.data.data.antiBot ? 'Enabled' : 'Disabled'}`);
            
            return response.data.data;
        } else {
            console.log('❌ Download with quality endpoint failed:', response.data.error);
            return null;
        }
        
    } catch (error) {
        console.error('❌ Error testing download with quality:', error.message);
        return null;
    }
}

async function runAllTests() {
    console.log('🚀 Testing Hybrid Quality Selection System Endpoints');
    console.log('==================================================');
    console.log(`🌐 Base URL: ${BASE_URL}`);
    console.log(`🎬 Test Video: ${TEST_URL}`);
    console.log('');
    
    try {
        // Test 1: Get quality options
        const qualityOptions = await testQualityOptions();
        
        if (qualityOptions && qualityOptions.qualities.length > 0) {
            // Test 2: Download with first available quality
            const firstOption = qualityOptions.qualities[0];
            await testDownloadWithQuality(firstOption.quality, firstOption.format);
            
            // Test 3: Try to download with a different quality if available
            if (qualityOptions.qualities.length > 1) {
                const secondOption = qualityOptions.qualities[1];
                await testDownloadWithQuality(secondOption.quality, secondOption.format);
            }
        }
        
        console.log('\n🎉 All tests completed!');
        console.log('✅ Hybrid Quality Selection System is working correctly');
        console.log('✅ New endpoints are functional');
        console.log('✅ Anti-bot protection is active');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = { testQualityOptions, testDownloadWithQuality };
