const https = require('https');

const testLogin = async () => {
  const postData = JSON.stringify({
    email: 'admin@elinsti.com',
    password: 'admin123'
  });

  const options = {
    hostname: 'elinsti.vercel.app',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`🔍 Status: ${res.statusCode}`);
      console.log(`🔍 Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`🔍 Response Body:`, data);
        try {
          const jsonData = JSON.parse(data);
          console.log(`🔍 Parsed JSON:`, JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log(`🔍 Raw response (not JSON):`, data);
        }
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.error(`🔴 Request error:`, error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

console.log('🚀 Probando login en producción...');
console.log('📧 Email: admin@elinsti.com');
console.log('🔑 Password: admin123');
console.log('🌐 URL: https://elinsti.vercel.app/api/auth/login');
console.log('');

testLogin()
  .then(result => {
    console.log('');
    console.log('✅ Test completado');
    console.log(`📊 Status: ${result.status}`);
  })
  .catch(error => {
    console.error('❌ Error en test:', error);
  }); 