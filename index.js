const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 10000;
const API_PASSWORD = process.env.API_PASSWORD || "0524988";

// Middleware de autenticação
app.use((req, res, next) => {
  const password = req.query.api_password || req.headers["x-api-password"];
  if (password !== API_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// Endpoint de teste de IP (retorna o IP público do proxy)
app.get("/myip", async (req, res) => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    res.json({ ip: data.ip, status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar IP" });
  }
});

// Endpoint genérico de proxy (ex: /proxy?url=https://api.ipify.org?format=json)
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: "Parâmetro 'url' é obrigatório" });
  }

  try {
    const response = await fetch(targetUrl);
    const body = await response.text();

    res.set("Content-Type", response.headers.get("content-type") || "text/plain");
    res.send(body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar URL", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
