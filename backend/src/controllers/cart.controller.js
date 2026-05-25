const pool = require('@/config/db');

// ========================= TAMBAH KE CART =========================
const addToCart = async (req, res) => {
    try {
        const { productId, size, quantity = 1 } = req.body;
        const userId = req.user.id;

        if (!productId) {
            return res.status(400).json({ message: 'productId wajib diisi' });
        }

        // Cek produk ada dan approved
        const [product] = await pool.query(
            'SELECT * FROM products WHERE id = ? AND status = "approved"',
            [productId]
        );
        if (product.length === 0) {
            return res.status(404).json({ message: 'Product tidak ditemukan atau belum disetujui' });
        }

        // Tidak bisa tambah produk sendiri ke cart
        if (product[0].sellerID === userId) {
            return res.status(403).json({ message: 'Tidak bisa menambahkan produk sendiri ke cart' });
        }

        // Use the requested size or fallback to first available size with stock
        let selectedSize = size;
        if (!selectedSize) {
            const [sizeRow] = await pool.query(
                'SELECT * FROM product_sizes WHERE productId = ? AND stock > 0 LIMIT 1',
                [productId]
            );
            if (sizeRow.length === 0) {
                return res.status(400).json({ message: 'Stok produk sudah habis' });
            }
            selectedSize = sizeRow[0].size;
        } else {
            // Validate that selected size has stock
            const [sizeRow] = await pool.query(
                'SELECT * FROM product_sizes WHERE productId = ? AND size = ? AND stock > 0',
                [productId, selectedSize]
            );
            if (sizeRow.length === 0) {
                // Fallback to any available size
                const [fallbackSize] = await pool.query(
                    'SELECT * FROM product_sizes WHERE productId = ? AND stock > 0 LIMIT 1',
                    [productId]
                );
                if (fallbackSize.length === 0) {
                    return res.status(400).json({ message: 'Stok produk sudah habis' });
                }
                selectedSize = fallbackSize[0].size;
            }
        }

        // Cek sudah ada di cart dengan size yang sama
        const [existing] = await pool.query(
            'SELECT id FROM cart_items WHERE userId = ? AND productId = ? AND size = ?',
            [userId, productId, selectedSize]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Produk dengan ukuran ini sudah ada di cart' });
        }

        const qty = parseInt(quantity) || 1;
        const totalPrice = product[0].price * qty;

        await pool.query(
            'INSERT INTO cart_items (userId, productId, size, price, quantity, totalPrice) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, productId, selectedSize, product[0].price, qty, totalPrice]
        );

        return res.status(200).json({ message: 'Product berhasil ditambahkan ke cart' });
    } catch (error) {
        console.error('addToCart error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// ========================= LIHAT CART =========================
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const [cart] = await pool.query(`
            SELECT c.*, 
                   p.name as product_name, 
                   p.price as product_price, 
                   p.item_condition,
                   p.category as productCategory,
                   p.imageUrl as imageUrl
            FROM cart_items c
            JOIN products p ON c.productId = p.id
            WHERE c.userId = ?
        `, [userId]);
        
        const grandTotal = cart.reduce((sum, item) => sum + Number(item.price), 0);

        return res.status(200).json({
            message: 'Berhasil ambil cart',
            total: cart.length,
            grandTotal,
            data: cart
        });
    } catch (error) {
        console.error('getCart error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// ========================= HAPUS ITEM DARI CART =========================
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const [item] = await pool.query(
            'SELECT id FROM cart_items WHERE userId = ? AND productId = ?',
            [userId, productId]
        );
        if (item.length === 0) {
            return res.status(404).json({ message: 'Item tidak ditemukan di cart' });
        }

        await pool.query('DELETE FROM cart_items WHERE id = ?', [item[0].id]);

        const [cart] = await pool.query('SELECT * FROM cart_items WHERE userId = ?', [userId]);

        return res.status(200).json({ message: 'Item berhasil dihapus dari cart', data: cart });
    } catch (error) {
        console.error('removeFromCart error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// ========================= KOSONGKAN CART =========================
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        await pool.query('DELETE FROM cart_items WHERE userId = ?', [userId]);

        return res.status(200).json({ message: 'Cart berhasil dikosongkan' });
    } catch (error) {
        console.error('clearCart error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = { addToCart, getCart, removeFromCart, clearCart };