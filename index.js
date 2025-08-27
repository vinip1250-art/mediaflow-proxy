const express = require('express');
const request = require('request');
const app = express();

const PORT = process.env.PORT || 10000;
const API_PASSWORD = process.env.API_PASSWORD || '0524988';

// 🔹 Faz o Express confiar nos headers do proxy (necessário no Render)
app.set('trust proxy', true);

// Middleware de autenticação via api_password
app.use((req, res, next) => {
  const password = req.query.api_password || req.headers['x-api-password'];
  if (password !== API_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Endpoint para testar o IP detectado
app.get('/proxy/ip', (req, res) => {
  const ip =
    req.ip || // Express já usa x-forwarded-for quando trust proxy está ativado
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim();

  res.json({ ip, status: 'ok' });
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
