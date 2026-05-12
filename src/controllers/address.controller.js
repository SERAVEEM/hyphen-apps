// ============= ADD ADDRESS ==================
const addAddress = (req, res) => {
    const { address } = req.body;
    const userId = req.user.id;
    const user = users.find((u) => u.id === userId);
    if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    if (!address) {
        return res.status(400).json({ message: 'Alamat wajib diisi' });
    }
    user.address.push(address);
    res.status(201).json({
        message: 'Alamat berhasil ditambahkan',
        data: address
    });
};


