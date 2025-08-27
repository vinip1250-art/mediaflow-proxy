const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;

const API_PASSWORD = process.env.API_PASSWORD || "0524988";

app.use((req, res, next) => {
  // verifica header
  const headerKey = req.headers["x-api-key"];
  // verifica query string
  const queryKey = req.query.api_password;

  if (headerKey === API_PASSWORD || queryKey === API_PASSWORD) {
    return next();
  }

  return res.status(401).json({ error: "Unauthorized" });
});

app.get("/proxy/ip", (req, res) => {
  res.json({ ip: req.ip, status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
