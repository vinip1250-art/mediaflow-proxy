// Rota de proxy genérica melhorada
app.get("/proxy", checkAuth, async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: "URL inválida" });
  }

  try {
    const response = await fetch(targetUrl, {
      redirect: "follow", // 🔹 Seguir redirecionamentos
      headers: req.headers // 🔹 Repassar headers originais do cliente
    });

    // 🔹 Copiar todos os headers da resposta
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const body = await response.text();
    res.status(response.status).send(body);

  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar URL", details: err.message });
  }
});
