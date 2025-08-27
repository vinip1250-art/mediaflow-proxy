const express = require("express");
const request = require("request");
const app = express();

const PORT = process.env.PORT || 8888;
const API_USER = process.env.API_USER;
const API_PASSWORD = process.env.API_PASSWORD;

// 🔒 Middleware de autenticação básica
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
    return res.status(403).send("Forbidden");
  }
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
