/*
 * queries.js
 * ----------
 * Todas as consultas ao banco que as rotas reutilizam ficam aqui.
 * Assim as rotas ficam curtas e o SQL fica num lugar só.
 */
const db = require('./database');

// Converte uma linha do banco no formato que o front-end já usa.
// (attr e specs estão como texto JSON no banco, então fazemos JSON.parse.)
function rowToProduct(row) {
  return {
    id: row.id,
    cat: row.cat,
    brand: row.brand,
    name: row.name,
    price: row.price,
    list: row.list,
    attr: JSON.parse(row.attr),
    specs: JSON.parse(row.specs),
    hot: row.hot,
    esq: row.esq,
  };
}

function getProducts() {
  return db.prepare('SELECT * FROM products ORDER BY position').all().map(rowToProduct);
}

// Devolve só o que o carrinho precisa de um produto (ou undefined se não existir).
function findProduct(id) {
  return db.prepare('SELECT id, name, price FROM products WHERE id = ?').get(id);
}

// { f16: 'asus-tuf...', rtx5060: '...' }
function getHighlights() {
  const rows = db.prepare('SELECT key, product_id FROM highlights').all();
  return Object.fromEntries(rows.map((r) => [r.key, r.product_id]));
}

// [{ name, desc, items: ['id1','id2','id3'] }, ...]
function getKits() {
  const itemsOf = db.prepare('SELECT product_id FROM kit_items WHERE kit_id = ? ORDER BY position');
  return db.prepare('SELECT * FROM kits ORDER BY id').all().map((kit) => ({
    name: kit.name,
    desc: kit.description,
    items: itemsOf.all(kit.id).map((r) => r.product_id),
  }));
}

// Cupom ativo (ou undefined). Aceita minúsculas: "tech10" vira "TECH10".
function findCoupon(code) {
  return db.prepare('SELECT code, percent FROM coupons WHERE code = ? AND active = 1')
    .get(String(code).trim().toUpperCase());
}

module.exports = { getProducts, findProduct, getHighlights, getKits, findCoupon };
