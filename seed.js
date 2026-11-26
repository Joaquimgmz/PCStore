/*
 * seed.js
 * -------
 * "Seed" = semente: copia os dados iniciais de data/catalog.json para o banco.
 *
 *  - O servidor chama seedIfEmpty() ao iniciar: se o banco está vazio, popula.
 *  - Para recarregar o catálogo na mão (apaga e insere de novo): npm run seed
 *    (os pedidos já feitos NÃO são apagados).
 */
const db = require('./database');
const catalog = require('../data/catalog.json');

// Cupons iniciais. O cupom TECH10 aparece no post-it do front.
const COUPONS = [{ code: 'TECH10', percent: 0.10 }];

function seed() {
  // db.transaction: ou tudo é gravado, ou nada. Evita banco "pela metade".
  const run = db.transaction(() => {
    // Apaga na ordem certa (primeiro quem depende dos produtos).
    db.exec(`
      DELETE FROM kit_items; DELETE FROM kits; DELETE FROM highlights;
      DELETE FROM products;  DELETE FROM coupons;
    `);

    // O "?" é um parâmetro: o valor é enviado separado do SQL. É assim que
    // se evita SQL Injection (nunca montar SQL juntando texto do usuário).
    const insertProduct = db.prepare(`
      INSERT INTO products (id, position, cat, brand, name, price, list, attr, specs, hot, esq)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    catalog.products.forEach((p, i) => {
      insertProduct.run(
        p.id, i, p.cat, p.brand, p.name, p.price, p.list,
        JSON.stringify(p.attr), JSON.stringify(p.specs), p.hot || 0, p.esq || 0
      );
    });

    const insertHighlight = db.prepare('INSERT INTO highlights (key, product_id) VALUES (?, ?)');
    for (const [key, productId] of Object.entries(catalog.promo)) {
      insertHighlight.run(key, productId);
    }

    const insertKit = db.prepare('INSERT INTO kits (id, name, description) VALUES (?, ?, ?)');
    const insertKitItem = db.prepare('INSERT INTO kit_items (kit_id, product_id, position) VALUES (?, ?, ?)');
    catalog.kits.forEach((kit, i) => {
      insertKit.run(i + 1, kit.name, kit.desc);
      kit.items.forEach((productId, pos) => insertKitItem.run(i + 1, productId, pos));
    });

    const insertCoupon = db.prepare('INSERT INTO coupons (code, percent) VALUES (?, ?)');
    COUPONS.forEach((c) => insertCoupon.run(c.code, c.percent));
  });

  run();
}

function seedIfEmpty() {
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM products').get();
  if (n === 0) {
    seed();
    console.log('Banco vazio: catálogo carregado a partir de data/catalog.json');
  }
}

module.exports = { seed, seedIfEmpty };

// Executado direto (npm run seed), e não importado pelo server.js:
if (require.main === module) {
  seed();
  console.log(`Catálogo recarregado: ${catalog.products.length} produtos, ${catalog.kits.length} kits.`);
}
