const pool = require('@/config/db');

// ========================= GET DASHBOARD STATS =========================
// GET /admin/stats
const getDashboardStats = async (req, res) => {
    try {
        // Total Users
        const [users] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role != 'admin'");
        const totalUsers = users[0].count;

        // Active Sellers (users who have products)
        const [sellers] = await pool.query("SELECT COUNT(DISTINCT sellerID) as count FROM products");
        const activeSellers = sellers[0].count;

        // Curated (approved) Products
        const [approved] = await pool.query("SELECT COUNT(*) as count FROM products WHERE status = 'approved'");
        const curatedProducts = approved[0].count;

        // Pending Products
        const [pending] = await pool.query("SELECT COUNT(*) as count FROM products WHERE status = 'pending'");
        const pendingProducts = pending[0].count;

        return res.status(200).json({
            message: 'Berhasil ambil dashboard stats',
            data: {
                totalUsers,
                activeSellers,
                curatedProducts,
                pendingProducts
            }
        });
    } catch (error) {
        console.error('getDashboardStats error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = { getDashboardStats };
