const express = require('express');
const app = express();

// Porta definida pelo Render
const PORT = process.env.PORT || 3000;

// Endpoint básico para teste
app.get('/', (req, res) => {
  res.send('🚀 MediaFlow rodando no Render.com');
});

// Exemplo de endpoint do proxy
app.get('/rest/1.0/user', (req, res) => {
  res.json({ status: "ok", user: "MediaFlow Proxy ativo!" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MediaFlow rodando na porta ${PORT}`);
});
