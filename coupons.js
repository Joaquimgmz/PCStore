/*
 * GET /api/coupons/:code
 * Diz se um cupom existe e quanto de desconto ele dá.
 * Exemplo: GET /api/coupons/TECH10  ->  { "valid": true, "code": "TECH10", "percent": 0.1 }
 */
const express = require('express');
const { findCoupon } = require('../queries');

const router = express.Router();

router.get('/:code', (req, res) => {
  const coupon = findCoupon(req.params.code);
  if (!coupon) {
    // Cupom inexistente não é "erro do servidor": é uma resposta normal (200)
    // dizendo que não é válido.
    return res.json({ valid: false });
  }
  res.json({ valid: true, code: coupon.code, percent: coupon.percent });
});

module.exports = router;
