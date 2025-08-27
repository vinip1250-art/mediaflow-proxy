const express = require("express");
const request = require("request");
const app = express();

const PORT = process.env.PORT || 8888;
const API_USER = process.env.API_USER || "vini";
const API_PASSWORD = process.env.API_PASSWORD || "0524988";

// 🔐 Middleware de autenticação básica
// Middleware de autenticação, exceto para /rest/1.0/public-ip
app.use((req, res, next) => {
  if (req.path === "/rest/1.0/public-ip") {
    return next(); // ignora autenticação para essa rota
  }

  const auth = req.headers["authorization"];
  if (!auth) {
    res.set("WWW-Authenticate", 'Basic realm="MediaFlow Proxy"');
    return res.status(401).send("Auth required");
  }

  const base64Credentials = auth.split(" ")[1];
  const [user, password] = Buffer.from(base64Credentials, "base64").toString("ascii").split(":");

  if (user === API_USER && password === API_PASSWORD) {
    next();
  } else {
    res.status(403).send("Forbidden");
  }
});


// 🔹 Rota para retornar IP público (necessário para AIOStreams/Stremio)
app.get("/rest/1.0/public-ip", (req, res) => {
  request("https://api.ipify.org?format=json", (error, response, body) => {
    if (error) return res.status(500).send("Error getting public IP");
    res.setHeader("Content-Type", "application/json");
    res.send(body);
  });
});

// 🔹 Rota /rest/1.0/user (fake só para validar no AIOStreams)
app.get("/rest/1.0/user", (req, res) => {
  res.json({
    user: "mediaflow",
    status: "ok",
    proxy: true,
  });
});

// 🔹 Proxy simples (exemplo: repassar requests HTTP)
app.use("/", (req, res) => {
  res.send("🚀 MediaFlow Proxy ativo!");
});

app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
