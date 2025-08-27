const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;
const API_PASSWORD = process.env.API_PASSWORD || '0524988';

app.set('trust proxy', true);

// 🔐 autenticação
app.use((req, res, next) => {
  const password = req.query.api_password || req.headers['x-api-password'];
  if (password !== API_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// 🔎 endpoint para ver o IP público real do servidor
app.get('/proxy/ip', async (req, res) => {
  try {
    const r = await fetch('https://api.ipify.org?format=json');
    const data = await r.json();
    res.json({ ip: data.ip, status: 'ok' });
  } catch (err) {
    res.json({ error: err.message, status: 'fail' });
  }
});

// 🌍 proxy genérico
app.use('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing url parameter');

  try {
    const r = await fetch(targetUrl, { method: req.method, headers: req.headers });
    res.status(r.status);
    r.body.pipe(res);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
