const express = require("express");
const app = express();

const PORT = process.env.PORT || 10000;
const API_PASSWORD = process.env.API_PASSWORD || "0524988";

// Middleware para autenticar com api_password
app.use((req, res, next) => {
  const apiPassword = req.query.api_password;
  if (apiPassword !== API_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// Rota principal de teste
app.get("/", (req, res) => {
  res.send("✅ MediaFlow Proxy rodando!");
});

// Nova rota /myip
app.get("/myip", (req, res) => {
  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress;
  res.json({ ip, status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
