/*
 * GET /api/catalog
 * Devolve o catálogo inteiro (produtos, promoções e kits) no formato que o
 * front-end já usa. O front carrega isso uma vez ao abrir a página e faz
 * busca, filtros e ordenação no navegador.
 */
const express = require('express');
const { getProducts, getHighlights, getKits } = require('../queries');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    products: getProducts(),
    promo: getHighlights(),
    kits: getKits(),
  });
});

module.exports = router;
