const express = require("express");
const fetch = require("node-fetch");
const app = express();

const PORT = process.env.PORT || 8888;
const API_USER = process.env.API_USER || "vini";
const API_PASSWORD = process.env.API_PASSWORD || "0524988";

// 🔐 Middleware de autenticação básica
app.use((req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth) {
    res.set("WWW-Authenticate", 'Basic realm="MediaFlow Proxy"');
    return res.status(401).send("Auth required");
  }

  const base64Credentials = auth.split(" ")[1];
  const [user, password] = Buffer.from(base64Credentials, "base64")
    .toString("ascii")
    .split(":");

  if (user === API_USER && password === API_PASSWORD) {
    next();
  } else {
    res.status(403).send("Forbidden");
  }
});

// 🌍 Rota para retornar IP público (usado pelo AIOStreams/Stremio)
app.get("/rest/1.0/public-ip", async (req, res) => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).send("Error getting public IP");
  }
});

// ✅ Rota de teste
app.get("/rest/1.0/user", (req, res) => {
  res.json({ user: API_USER, status: "ok" });
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
