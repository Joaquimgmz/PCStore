/*
 * pricing.js
 * ----------
 * As REGRAS DE PREÇO da loja. É uma função "pura": recebe dados, devolve o
 * resultado e não mexe no banco nem na internet. Por isso é fácil de testar
 * e de explicar.
 *
 * Ordem dos descontos (a mesma que o front-end mostra no carrinho):
 *   1. Subtotal           = soma de preço × quantidade
 *   2. Desconto do kit    = 5% sobre os itens de cada kit completo
 *   3. Cupom              = % do cupom sobre (subtotal - kit)
 *   4. Desconto PIX       = 10% sobre o que sobrou (só se pagar no PIX)
 *   5. Frete              = grátis a partir de R$ 299 de subtotal; senão R$ 29,90
 *   Total = subtotal - kit - cupom - pix + frete
 */
const KIT_DISCOUNT = 0.05;
const PIX_DISCOUNT = 0.10;
const FREE_SHIPPING_FROM = 299;
const SHIPPING_FEE = 29.9;

// Arredonda para 2 casas (centavos).
const round2 = (n) => Math.round(n * 100) / 100;

/**
 * @param {Array}  lines       [{ id, price, qty }]  itens do carrinho, com preço vindo do BANCO
 * @param {Array}  kits        [{ items: [id, id, id] }]
 * @param {number} couponRate  0.10 para 10%, ou 0 se não há cupom
 * @param {string} payment     'pix' ou 'card'
 */
function calculateTotals(lines, kits, couponRate, payment) {
  const qtyOf = Object.fromEntries(lines.map((l) => [l.id, l.qty]));
  const priceOf = Object.fromEntries(lines.map((l) => [l.id, l.price]));

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  // Kit: se o carrinho tem todos os itens do kit, vale 5% de desconto.
  // Math.min pega a menor quantidade entre os itens = quantos kits completos existem.
  let kitDiscount = 0;
  for (const kit of kits) {
    const completeKits = Math.min(...kit.items.map((id) => qtyOf[id] || 0));
    if (completeKits > 0) {
      const kitPrice = kit.items.reduce((sum, id) => sum + priceOf[id], 0);
      kitDiscount += kitPrice * completeKits * KIT_DISCOUNT;
    }
  }
  kitDiscount = round2(kitDiscount);

  const couponDiscount = round2((subtotal - kitDiscount) * couponRate);
  const afterDiscounts = subtotal - kitDiscount - couponDiscount;
  const pixDiscount = payment === 'pix' ? round2(afterDiscounts * PIX_DISCOUNT) : 0;
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;

  return {
    subtotal: round2(subtotal),
    kitDiscount,
    couponDiscount,
    pixDiscount,
    shipping,
    total: round2(afterDiscounts - pixDiscount + shipping),
  };
}

module.exports = { calculateTotals };
