const express = require('express');
const request = require('request');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;
const API_PASSWORD = process.env.API_PASSWORD || "0524988"; // senha padrão

// Middleware de autenticação simples
app.use((req, res, next) => {
  const pass = req.query.api_password || req.headers['x-api-password'];
  if (pass !== API_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// Endpoint /myip -> retorna IP do proxy
app.get('/myip', async (req, res) => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    res.json({ ip: data.ip, status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Endpoint /proxy -> acessa qualquer URL
app.get('/proxy', (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  request(targetUrl, (error, response, body) => {
    if (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }

    try {
      // tenta parsear JSON
      const json = JSON.parse(body);
      return res.json(json);
    } catch (e) {
      // se não for JSON, retorna como texto
      return res.json({ status: "ok", response: body });
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
