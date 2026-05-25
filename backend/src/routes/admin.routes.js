const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('@/controllers/admin.controller');
const { authMiddleware } = require('@/middleware/auth.middleware');
const { roleMiddleware } = require('@/middleware/role.middleware');

router.get('/stats', authMiddleware, roleMiddleware, getDashboardStats);

module.exports = router;
