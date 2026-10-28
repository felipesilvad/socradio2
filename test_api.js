// Simple API test script
const http = require('http');

// Test function
function testAPI(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Test the API
async function runTests() {
  console.log('🧪 Testing Global Playback API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await testAPI('/health');
    console.log('✅ Health:', JSON.stringify(health, null, 2));

    // Test getting stations (we need to add this endpoint)
    console.log('\n2. Testing playlist endpoint...');
    const playlist = await testAPI('/api/playback/playlist/main-station');
    console.log('✅ Playlist:', JSON.stringify(playlist, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runTests();
