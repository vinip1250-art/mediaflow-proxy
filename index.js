const express = require("express");
const request = require("request");

const app = express();
const PORT = process.env.PORT || 10000;
const API_PASSWORD = process.env.API_PASSWORD || "0524988"; // senha padrão se não setada

// Middleware de autenticação via query param
app.use((req, res, next) => {
  const pass = req.query.api_password;
  if (pass !== API_PASSWORD) {
    res.set("WWW-Authenticate", 'Basic realm="MediaFlow Proxy"');
    return res.status(401).send("Unauthorized");
  }
  next();
});

// Endpoint para testar IP do servidor
app.get("/myip", (req, res) => {
  request("https://api.ipify.org?format=json", { json: true }, (err, resp, body) => {
    if (err) return res.status(500).json({ status: "error", message: err.message });
    res.json({ ip: body.ip, status: "ok" });
  });
});

// Endpoint /proxy -> acessa qualquer URL
app.get("/proxy", (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  request({
    url: targetUrl,
    headers: {
      "X-Forwarded-For": undefined, // remove IP real do cliente
      "Via": "mediaflow-proxy"
    }
  }, (error, response, body) => {
    if (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }

    try {
      const json = JSON.parse(body);
      return res.json(json);
    } catch (e) {
      return res.send(body);
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
