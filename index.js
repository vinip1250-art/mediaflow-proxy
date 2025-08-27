const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 10000;
const API_PASSWORD = process.env.API_PASSWORD || "0524988";

// 🔐 Middleware para autenticação simples com query param api_password
app.use((req, res, next) => {
  const password = req.query.api_password;
  if (!password || password !== API_PASSWORD) {
    res.set("WWW-Authenticate", 'Basic realm="MediaFlow Proxy"');
    return res.status(401).send("Unauthorized");
  }
  next();
});

// 🟢 Endpoint de status
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "🚀 MediaFlow Proxy ativo!" });
});

// 🟢 Retorna o IP público do servidor proxy
app.get("/myip", async (req, res) => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    res.json({ ip: data.ip, status: "ok" });
  } catch (err) {
    console.error("Erro ao buscar IP:", err);
    res.status(500).json({ error: "Erro ao obter IP público" });
  }
});

// 🟢 Proxy para qualquer URL (uso: /proxy?api_password=xxxx&url=http...)
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
    console.error("Erro no proxy:", err);
    res.status(500).json({ error: "Erro ao acessar a URL solicitada" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MediaFlow Proxy rodando na porta ${PORT}`);
});
