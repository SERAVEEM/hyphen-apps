const express = require('express');
const router = express.Router();
const { addToCart, getCart, updateCart, removeFromCart, clearCart } = require('@/controllers/cart.controller');
const { authMiddleware } = require('@/middleware/auth.middleware');

router.get('/', authMiddleware, getCart);
router.post('/add', authMiddleware, addToCart);
router.put('/update', authMiddleware, updateCart);
router.delete('/remove', authMiddleware, removeFromCart);
router.delete('/clear', authMiddleware, clearCart);

module.exports = router;