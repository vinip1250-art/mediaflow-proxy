const express = require("express");
const request = require("request");
const app = express();

const PORT = process.env.PORT || 8888;
const API_USER = process.env.API_USER;
const API_PASSWORD = process.env.API_PASSWORD;

// 🔒 Middleware de autenticação básica
const auth = require('basic-auth');

app.use((req, res, next) => {
  const user = auth(req);
  if (!user || user.pass !== process.env.API_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="MediaFlow Proxy"');
    return res.status(401).send('Unauthorized');
  }
  next();
});


// 🌍 Rota para IP público (AIOStreams/Stremio precisa dela)
app.get("/rest/1.0/public-ip", (req, res) => {
  request("https://api.ipify.org?format=json", (error, response, body) => {
    if (error) return res.status(500).send("Error getting public IP");
    res.type("json").send(body);
  });
});

// 🚀 Inicia servidor
app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
