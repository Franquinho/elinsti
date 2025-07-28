const https = require('https');

const testLogin = async () => {
  const url = 'https://elinsti.vercel.app/api/auth/login';
  const data = JSON.stringify({
    email: 'admin@elinsti.com',
    password: 'Admin123!'
  });

  const options = {
    hostname: 'elinsti.vercel.app',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Headers:', res.headers);
        console.log('Response:', responseData);
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

console.log('🧪 Probando endpoint de login...');
testLogin()
  .then(result => {
    console.log('✅ Prueba completada');
  })
  .catch(error => {
    console.error('❌ Error en la prueba:', error);
  }); 