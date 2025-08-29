const express = require("express");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const app = express();

const PORT = process.env.PORT || 10000;
const API_PASSWORD = process.env.API_PASSWORD || "0524988";

// 🔑 Middleware de autenticação
function checkAuth(req, res, next) {
  const passwordFromQuery = req.query.api_password;
  const passwordFromHeader = req.headers["x-api-password"];

  if (passwordFromQuery !== API_PASSWORD && passwordFromHeader !== API_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// Rota padrão
app.get("/", (req, res) => {
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
    console.error("Erro no proxy:", err.message);
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
    console.error("Erro ao obter IP:", err.message);
    res.status(500).json({ error: "Erro ao obter IP", details: err.message });
  }
});

// 🆕 Rota de debug
app.all("/proxy/debug", checkAuth, (req, res) => {
  res.json({
    method: req.method,
    query: req.query,
    headers: req.headers,
    body: req.body || null,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
