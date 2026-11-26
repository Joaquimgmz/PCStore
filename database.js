/*
 * database.js
 * -----------
 * Abre (ou cria) o banco SQLite e garante que as tabelas existam.
 *
 * SQLite guarda tudo em UM arquivo (data/techstore.db). Não precisa instalar
 * nem configurar servidor de banco: ótimo para um projeto de estudo.
 *
 * Usamos a biblioteca "better-sqlite3", que é SÍNCRONA: a consulta roda e já
 * devolve o resultado, sem callbacks nem async/await. Isso deixa o código
 * bem mais fácil de ler.
 */
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, '..', 'data', 'techstore.db'));

// Faz o banco respeitar as chaves estrangeiras (FOREIGN KEY).
db.pragma('foreign_keys = ON');

db.exec(`
  -- Produtos do catálogo. "attr" e "specs" são objetos, guardados como texto JSON.
  CREATE TABLE IF NOT EXISTS products (
    id        TEXT PRIMARY KEY,
    position  INTEGER NOT NULL,          -- ordem original do catálogo
    cat       TEXT NOT NULL,             -- departamento (cpu, gpu, ram...)
    brand     TEXT NOT NULL,
    name      TEXT NOT NULL,
    price     REAL NOT NULL,             -- preço atual (cartão)
    list      REAL NOT NULL,             -- preço "de" (riscado)
    attr      TEXT NOT NULL,             -- filtros (JSON)
    specs     TEXT NOT NULL,             -- ficha técnica (JSON)
    hot       INTEGER NOT NULL DEFAULT 0,-- mais vendido
    esq       INTEGER NOT NULL DEFAULT 0 -- faz parte do "Esquenta Black Friday"
  );

  -- Produtos usados nas promoções da home e dos post-its (f16, rtx5060...).
  CREATE TABLE IF NOT EXISTS highlights (
    key        TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id)
  );

  -- Kits de upgrade (processador + placa-mãe + memória).
  CREATE TABLE IF NOT EXISTS kits (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS kit_items (
    kit_id     INTEGER NOT NULL REFERENCES kits(id),
    product_id TEXT    NOT NULL REFERENCES products(id),
    position   INTEGER NOT NULL
  );

  -- Cupons de desconto. percent = 0.10 significa 10%.
  CREATE TABLE IF NOT EXISTS coupons (
    code    TEXT PRIMARY KEY,
    percent REAL NOT NULL,
    active  INTEGER NOT NULL DEFAULT 1
  );

  -- Pedidos. Guardamos os valores calculados na hora da compra.
  CREATE TABLE IF NOT EXISTS orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    code            TEXT NOT NULL UNIQUE,   -- ex.: TS-482913 (o que o cliente vê)
    payment         TEXT NOT NULL,          -- 'pix' ou 'card'
    coupon          TEXT,                   -- cupom usado (ou NULL)
    subtotal        REAL NOT NULL,
    kit_discount    REAL NOT NULL,
    coupon_discount REAL NOT NULL,
    pix_discount    REAL NOT NULL,
    shipping        REAL NOT NULL,
    total           REAL NOT NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Itens de cada pedido. Copiamos nome e preço do produto ("foto" da compra):
  -- se o preço mudar amanhã, o pedido antigo continua com o valor que foi pago.
  CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL REFERENCES orders(id),
    product_id TEXT    NOT NULL,
    name       TEXT    NOT NULL,
    unit_price REAL    NOT NULL,
    quantity   INTEGER NOT NULL
  );
`);

module.exports = db;
