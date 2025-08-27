const express = require("express");
const request = require("request");
const auth = require("basic-auth");

const app = express();

// Porta: usa a do Render/Heroku (process.env.PORT) ou 8888 local
const PORT = process.env.PORT || 8888;

// Middleware de autenticação: só senha
app.use((req, res, next) => {
  const user = auth(req);

  if (!user || user.pass !== process.env.API_PASSWORD) {
    res.set("WWW-Authenticate", 'Basic realm="MediaFlow Proxy"');
    return res.status(401).send("Unauthorized");
  }

  next();
});

// Proxy de requisições
app.use((req, res) => {
  const targetUrl = req.url.replace(/^\/rest/, "https://api.real-debrid.com/rest");

  console.log(`➡️ Proxying: ${req.method} ${targetUrl}`);

  req.pipe(
    request({
      url: targetUrl,
      method: req.method,
      headers: {
        ...req.headers,
        host: "api.real-debrid.com",
      },
    })
  ).pipe(res);
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
