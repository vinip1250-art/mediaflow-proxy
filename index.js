const express = require("express");
const fetch = require("node-fetch");
const app = express();

const API_PASSWORD = process.env.API_PASSWORD || "0524988";

// Middleware de autenticação
app.use((req, res, next) => {
  const password = req.query.api_password;
  if (password !== API_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// Rota de proxy genérica
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  try {
    const response = await fetch(targetUrl);
    const body = await response.text();
    res.send(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Nova rota para verificar IP público do proxy
app.get("/proxy/ip", async (req, res) => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    res.json({ ip: data.ip, status: "ok" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
