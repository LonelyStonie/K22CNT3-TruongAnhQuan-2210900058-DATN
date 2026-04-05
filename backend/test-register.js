const http = require('http');

const data = JSON.stringify({
  fullname: "Nguyen Van A",
  email: "customer@gmail.com",
  password: "123456",
  phone: "0987654321"
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Ket qua:', body));
});

req.write(data);
req.end();