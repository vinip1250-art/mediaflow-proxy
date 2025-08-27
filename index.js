const express = require('express');
const request = require('request');
const app = express();

const PORT = process.env.PORT || 10000;
const API_PASSWORD = process.env.API_PASSWORD || '0524988';

// Middleware de autenticação básica via api_password
app.use((req, res, next) => {
  const password = req.query.api_password || req.headers['x-api-password'];
  if (password !== API_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Rota para verificar IP público
app.get('/proxy/ip', (req, res) => {
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    (req.connection?.socket ? req.connection.socket.remoteAddress : null);

  res.json({ ip, status: 'ok' });
});

// Exemplo de proxy simples (se precisar)
app.use('/proxy', (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  req.pipe(request(targetUrl)).pipe(res);
});

app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
