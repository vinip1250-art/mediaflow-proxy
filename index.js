const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
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
  res.send("🚀 MediaFlow Proxy ativo com suporte a HLS/DASH!");
});

// 🔹 Proxy genérico (respostas pequenas, JSON/texto)
app.get("/proxy", checkAuth, async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: "URL inválida" });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": req.headers["user-agent"] || "MediaFlow-Proxy",
        "Referer": req.headers["referer"] || "",
        Range: req.headers["range"] || "",
      },
    });

    res.set("Content-Type", response.headers.get("content-type") || "text/plain");
    const body = await response.text();
    res.send(body);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar URL", details: err.message });
  }
});

// 🔹 Proxy para streaming direto (vídeos/arquivos grandes)
app.get("/proxy/stream", checkAuth, async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: "URL inválida" });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": req.headers["user-agent"] || "MediaFlow-Proxy",
        "Referer": req.headers["referer"] || "",
        Range: req.headers["range"] || "",
      },
    });

    res.writeHead(response.status, Object.fromEntries(response.headers));
    response.body.pipe(res); // 🔥 Stream contínuo
  } catch (err) {
    res.status(500).json({ error: "Erro no streaming", details: err.message });
  }
});

// 🔹 Proxy para HLS (.m3u8)
app.get("/proxy/hls", checkAuth, async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl || !targetUrl.endsWith(".m3u8")) {
    return res.status(400).json({ error: "URL HLS inválida" });
  }

  try {
    const response = await fetch(targetUrl);
    res.set("Content-Type", "application/vnd.apple.mpegurl");
    const body = await response.text();
    res.send(body);
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar HLS", details: err.message });
  }
});

// 🔹 Proxy para DASH (.mpd)
app.get("/proxy/mpd", checkAuth, async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl || !targetUrl.endsWith(".mpd")) {
    return res.status(400).json({ error: "URL MPD inválida" });
  }

  try {
    const response = await fetch(targetUrl);
    res.set("Content-Type", "application/dash+xml");
    const body = await response.text();
    res.send(body);
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar MPD", details: err.message });
  }
});

// 🔹 Rota para verificar IP
app.get("/proxy/ip", checkAuth, async (req, res) => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    res.json({ ip: data.ip, status: "ok" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao obter IP", details: err.message });
  }
});

// 🔹 Debug
app.all("/proxy/debug", checkAuth, (req, res) => {
  res.json({
    method: req.method,
    query: req.query,
    headers: req.headers,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
