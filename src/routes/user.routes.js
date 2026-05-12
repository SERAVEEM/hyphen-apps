const express = require('express');
const router = express.Router();

const {authMiddleware} = require('@/middleware/auth.middleware');
const { getProfile, updateUser, changePassword, deleteUser, getWishlist, addWishlist, removeWishlist } = require('@/controllers/user.controller');
router.put('/update', authMiddleware, updateUser);
router.get('/profile', authMiddleware, getProfile);
router.put('/change-password', authMiddleware, changePassword);
router.delete('/delete', authMiddleware, deleteUser);

//WISHLIST
router.get('/wishlist', authMiddleware, getWishlist);
router.post('/add-wishlist', authMiddleware, addWishlist);
router.delete('/remove-wishlist', authMiddleware, removeWishlist);

module.exports = router;