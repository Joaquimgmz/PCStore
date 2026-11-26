/*
 * Pedidos
 *   POST /api/orders        cria um pedido (finalizar compra)
 *   GET  /api/orders/:code  consulta um pedido pelo código (ex.: TS-482913)
 *
 * REGRA DE OURO: o servidor NUNCA confia nos preços que vêm do navegador.
 * O front envia só "qual produto e quantas unidades"; os preços e os
 * descontos são recalculados aqui, com os dados do banco. Se alguém alterar
 * o JavaScript no navegador para mandar um preço menor, não adianta nada.
 */
const express = require('express');
const db = require('../database');
const { findProduct, getKits, findCoupon } = require('../queries');
const { calculateTotals } = require('../pricing');

const router = express.Router();

const PAYMENTS = ['pix', 'card'];
const MAX_QTY = 99;

// Gera um código como TS-482913 e garante que ainda não existe no banco.
function newOrderCode() {
  const exists = db.prepare('SELECT 1 FROM orders WHERE code = ?');
  let code;
  do {
    code = 'TS-' + Math.floor(100000 + Math.random() * 900000);
  } while (exists.get(code));
  return code;
}

/*
 * Corpo esperado (JSON):
 *   { "items": { "<id-do-produto>": quantidade, ... }, "coupon": "TECH10", "payment": "pix" }
 * (É o mesmo formato do objeto "cart" que o front já mantém.)
 */
router.post('/', (req, res) => {
  const { items, coupon, payment } = req.body || {};

  // ---------- 1. Validar o que chegou (nunca confie na entrada) ----------
  if (!items || typeof items !== 'object' || Array.isArray(items) || Object.keys(items).length === 0) {
    return res.status(400).json({ error: 'O carrinho está vazio.' });
  }
  if (!PAYMENTS.includes(payment)) {
    return res.status(400).json({ error: 'Forma de pagamento inválida.' });
  }

  // ---------- 2. Buscar cada produto no banco e conferir a quantidade ----------
  const lines = [];
  for (const [id, qty] of Object.entries(items)) {
    const product = findProduct(id);
    if (!product) {
      return res.status(400).json({ error: `Produto não encontrado: ${id}` });
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return res.status(400).json({ error: `Quantidade inválida para "${product.name}".` });
    }
    lines.push({ id: product.id, name: product.name, price: product.price, qty });
  }

  // ---------- 3. Cupom (opcional) ----------
  let couponRow = null;
  if (coupon) {
    couponRow = findCoupon(coupon);
    if (!couponRow) {
      return res.status(400).json({ error: `O cupom ${coupon} não existe.` });
    }
  }

  // ---------- 4. Calcular os valores (regras em pricing.js) ----------
  const totals = calculateTotals(lines, getKits(), couponRow ? couponRow.percent : 0, payment);

  // ---------- 5. Gravar pedido + itens numa transação ----------
  // Se algo der errado no meio, NADA é gravado (não fica pedido sem itens).
  const code = newOrderCode();
  const save = db.transaction(() => {
    const { lastInsertRowid } = db.prepare(`
      INSERT INTO orders (code, payment, coupon, subtotal, kit_discount, coupon_discount, pix_discount, shipping, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(code, payment, couponRow ? couponRow.code : null,
      totals.subtotal, totals.kitDiscount, totals.couponDiscount, totals.pixDiscount, totals.shipping, totals.total);

    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, product_id, name, unit_price, quantity) VALUES (?, ?, ?, ?, ?)'
    );
    for (const l of lines) insertItem.run(lastInsertRowid, l.id, l.name, l.price, l.qty);
  });
  save();

  // 201 = "Created" (recurso criado com sucesso)
  res.status(201).json({ code, payment, coupon: couponRow ? couponRow.code : null, ...totals });
});

router.get('/:code', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE code = ?').get(req.params.code.toUpperCase());
  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado.' });
  }
  const items = db.prepare(
    'SELECT product_id, name, unit_price, quantity FROM order_items WHERE order_id = ?'
  ).all(order.id);

  res.json({
    code: order.code,
    payment: order.payment,
    coupon: order.coupon,
    subtotal: order.subtotal,
    kitDiscount: order.kit_discount,
    couponDiscount: order.coupon_discount,
    pixDiscount: order.pix_discount,
    shipping: order.shipping,
    total: order.total,
    createdAt: order.created_at,
    items,
  });
});

module.exports = router;
