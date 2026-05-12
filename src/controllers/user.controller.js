const bcrypt = require('bcrypt');
const {users} = require('@/data/users.data');
const {products} = require('@/data/product.data');

// ========================= GET PROFILE =========================

const getProfile = (req, res) => {
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  const { password, ...safeUser } = user;

  res.status(200).json({
    message: 'Berhasil ambil profile',
    data: safeUser,
  });
};

// ========================= UPDATE PROFILE =========================

const updateUser = async (req, res) => {
  const { username, email } = req.body;

  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  if (email && users.find((u) => u.email === email.trim() && u.id !== user.id)) {
    return res.status(400).json({ message: 'Email sudah digunakan user lain' });
  }

  if (username) user.username = username;
  if (email) user.email = email.trim();

  const { password: _, ...updatedData } = user;

  res.status(200).json({
    message: 'User berhasil diupdate',
    data: updatedData,
  });
};

// ========================= CHANGE PASSWORD =========================

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: 'Password lama salah' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password baru harus minimal 6 karakter' });
  }

  user.password = await bcrypt.hash(newPassword, 10);

  res.status(200).json({ message: 'Password berhasil diubah' });
};


// ========================= DELETE USER =========================

const deleteUser = (req, res) => {
  const userIndex = users.findIndex((u) => u.id === req.user.id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  users.splice(userIndex, 1);

  res.status(200).json({ message: 'User berhasil dihapus' });
};


// ========================= TAMBAH WISHLIST =========================

const addWishlist = (req, res) => {
  const { productId } = req.body;
  const user = users.find((u) => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  const product = products.find(p => p.id === (productId));
  if (!product) {
    return res.status(404).json({ message: 'Product tidak ditemukan' });
  }

  if (user.wishlist.includes(productId)) {
    return res.status(400).json({ message: 'Product sudah ada di wishlist' });
  }

  user.wishlist.push(productId);

  res.status(200).json({ message: 'Product berhasil ditambahkan ke wishlist' });
};


// ========================= LIHAT WISHLIST =========================

const getWishlist = (req, res) => {
    const user = users.find((u) => u.id === req.user.id);

    if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
    }   
    const wishlistProducts = products.filter((p) => user.wishlist.includes(p.id));

    res.status(200).json({
        message: 'Berhasil ambil wishlist',
        data: wishlistProducts
    });
};

// ===================== HAPUS WISHLIST =========================
const removeWishlist = (req, res) => {
    const { productId } = req.body;
    const user = users.find((u) => u.id === req.user.id);

    if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (!user.wishlist.includes(productId)) {
        return res.status(404).json({ message: 'Product tidak ada di wishlist' });
    }

    user.wishlist = user.wishlist.filter((id) => id !== productId);

    return res.status(200).json({ message: 'Product berhasil dihapus dari wishlist' });
};

// ========================== CART ===============================




module.exports = { getProfile, updateUser, changePassword, deleteUser, getWishlist, addWishlist, removeWishlist };