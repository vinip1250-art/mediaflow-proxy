const express = require('express');
const fetch = require('node-fetch');
const request = require('request');

const app = express();
const PORT = process.env.PORT || 10000;
const API_PASSWORD = process.env.API_PASSWORD || "0524988";

// middleware para autenticação por senha
app.use((req, res, next) => {
  const apiPassword = req.query.api_password;
  if (!apiPassword || apiPassword !== API_PASSWORD) {
    return res.status(401).send('Unauthorized');
  }
  next();
});

// rota proxy principal: /proxy?url=https://...
app.get('/proxy', (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  request({
    url: targetUrl,
    method: 'GET',
    headers: req.headers
  }).pipe(res);
});

// rota para retornar o IP público do proxy
app.get('/proxy/ip', async (req, res) => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    res.json({ ip: data.ip, status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch IP' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
