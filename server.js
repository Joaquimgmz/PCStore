/*
 * server.js
 * ---------
 * Ponto de entrada. Faz três coisas:
 *   1. Monta a API em /api/... (catálogo, cupons, pedidos)
 *   2. Serve o front-end (pasta public/) como arquivos estáticos
 *   3. Trata erros de forma padronizada
 *
 * Para rodar:  npm start   ->   http://localhost:3000
 */
const path = require('path');
const express = require('express');
const { seedIfEmpty } = require('./src/seed');

seedIfEmpty(); // se o banco está vazio, carrega o catálogo

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: converte o corpo JSON das requisições em req.body.
// O limite evita que alguém mande um corpo gigante.
app.use(express.json({ limit: '100kb' }));

// ---------- API ----------
app.use('/api/catalog', require('./src/routes/catalog'));
app.use('/api/coupons', require('./src/routes/coupons'));
app.use('/api/orders', require('./src/routes/orders'));

// Qualquer outra rota /api/... não existe.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// ---------- Front-end ----------
// Serve public/index.html, public/css/..., public/js/...
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Tratamento de erros ----------
// Chega aqui quando algo lança exceção (ex.: JSON inválido, bug no código).
app.use((err, req, res, next) => {
  if (err.status === 400) {
    return res.status(400).json({ error: 'JSON inválido.' });
  }
  console.error(err);                         // o detalhe fica só no terminal
  res.status(500).json({ error: 'Erro interno do servidor.' }); // o cliente não vê detalhes
});

app.listen(PORT, () => {
  console.log(`TechStore rodando em http://localhost:${PORT}`);
});
