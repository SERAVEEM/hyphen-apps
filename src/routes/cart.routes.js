const express = require('express');
const router = express.Router();
const { addToCart, getCart, updateCart, removeFromCart, clearCart } = require('@/controllers/cart.controller');
const { authMiddleware } = require('@/middleware/auth.middleware');

router.get('/getcart', authMiddleware, getCart);
router.post('/addcart', authMiddleware, addToCart);
router.put('/updatecart/:productId/:size', authMiddleware, updateCart);
router.delete('/removefromcart/:productId/:size', authMiddleware, removeFromCart);
router.delete('/clearcart', authMiddleware, clearCart);

module.exports = router;