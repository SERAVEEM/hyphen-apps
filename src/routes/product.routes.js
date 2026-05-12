const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('@/controllers/product.controller');
const { authMiddleware } = require('@/middleware/auth.middleware');
const { roleMiddleware } = require('@/middleware/role.middleware');

//buat admin
router.post('/create', authMiddleware, createProduct);
router.put('/update', authMiddleware, updateProduct);
router.delete('/delete', authMiddleware, deleteProduct);

//ini buat public/user
router.get('/get-all', getAllProducts);
router.get('/get/:id', getProductById);



module.exports = router;