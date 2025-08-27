const express = require('express');
const request = require('request');
const os = require('os');
const dns = require('dns');
const app = express();

const PORT = process.env.PORT || 10000;
const API_PASSWORD = process.env.API_PASSWORD || '0524988';

// 🔹 Confiar em proxy (mas não vamos usar o IP do cliente)
app.set('trust proxy', true);

// Middleware de autenticação via api_password
app.use((req, res, next) => {
  const password = req.query.api_password || req.headers['x-api-password'];
  if (password !== API_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Endpoint para testar o IP detectado do servidor
app.get('/proxy/ip', (req, res) => {
  // Pega o IP público de saída do servidor
  dns.lookup(os.hostname(), (err, address) => {
    if (err) {
      return res.json({ error: 'Cannot resolve server IP', status: 'fail' });
    }
    res.json({ ip: address, status: 'ok' });
  });
});

// Proxy simples
app.use('/proxy', (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  req.pipe(request(targetUrl)).pipe(res);
});

// Inicializa servidor
app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
