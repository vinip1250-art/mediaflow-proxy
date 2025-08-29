const express = require("express");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const app = express();

const PORT = process.env.PORT || 10000;
const API_PASSWORD = process.env.API_PASSWORD || "0524988";

// 🔑 Middleware de autenticação
function checkAuth(req, res, next) {
  const password = req.query.api_password;
  if (password !== API_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// Rota padrão
app.get("/", checkAuth, (req, res) => {
  res.send("🚀 MediaFlow Proxy ativo!");
});

// Rota de proxy genérica
app.get("/proxy", checkAuth, async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: "URL inválida" });
  }

  try {
    const response = await fetch(targetUrl);
    const body = await response.text();

    res.set("Content-Type", response.headers.get("content-type") || "text/plain");
    res.send(body);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar URL", details: err.message });
  }
});

// 🆕 Rota para verificar o IP do proxy
app.get("/proxy/ip", checkAuth, async (req, res) => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    res.json({ ip: data.ip, status: "ok" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao obter IP", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
