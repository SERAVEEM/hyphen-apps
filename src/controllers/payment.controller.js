const { v4: uuidv4 } = require('uuid');
const { users } = require('@/data/users.data');
const {orders} = require('@/data/order.data');
const {payments} = require('@/data/payment.data');
const { handlePaymentMethod } = require('@/helpers/payment.helpers');
;


const VALID_METHODS = ['transfer', 'cash', 'qris', 'credit_card'];


// ========================= CREATE PAYMENT =========================
const createPayment = (req, res) => {
    const { orderId, paymentMethod } = req.body;
    const userId = req.user.id;
    
    if (!orderId || !paymentMethod) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
    }
    if (!VALID_METHODS.includes(paymentMethod.toLowerCase())) {
        return res.status(400).json({ message: 'Metode pembayaran tidak valid' });
    }
    const user = users.find((u) => u.id === userId);
    if(!user){
       return res.status(400).json({ message: 'User tidak ditemukan' });
    }
    const order = orders.find((o) => o.id === orderId);
    
    if (!order){
        return res.status(404).json({ message: 'Order tidak ditemukan' });
    }
    if (order.status!== 'pending') {
        return res.status(400).json({ message: 'Order sudah dibayar atau dibatalkan' });   
    }
    if(!user.payments){
        user.payments = [];
    }

    const alreadyPaid = user.payments.find(p => p.orderId === orderId);
    if (alreadyPaid) {
        return res.status(400).json({ message: 'Order sudah dibayar' });
    }

    const methodResult = handlePaymentMethod(paymentMethod, order.totalPrice);
    if (!methodResult.success) {
        return res.status(400).json({ message: methodResult.message });
    }

    const newPayment = {
        id: uuidv4(),
        orderId,
        amount : order.totalPrice,
        paymentMethod: paymentMethod.toLowerCase(),
        status : methodResult.status,
        createdAt : new Date(),
    };

    order.status = methodResult.status;
    user.payments.push(newPayment);
    payments.push(newPayment);

    return res.status(201).json({
        message: 'Pembayaran berhasil',
        data: newPayment
    });
};


// ========================= RIWAYAT PEMBAYARAN (USER) =========================
const getPayments = (req, res) => {
    const user = users.find((u) => u.id === req.user.id);
    if(!user){
        return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    res.status(200).json({
        message: 'Riwayat pembayaran',
        total : user.payments ? user.payments.length : 0,
        data: user.payments
    });
};


// ========================= RIWAYAT SEMUA PEMBAYARAN (ADMIN) =========================
const getAllPayments = (req, res) => {
    const allPayments = users.flatMap((u) => u.payments || []);
 
    return res.status(200).json({
        message: 'Semua data pembayaran',
        total: allPayments.length,
        data: allPayments
    });
};


// ========================= CEK DETAIL STATUS PEMBAYARAN DARI ID (ADMIN) =========================
const getPaymentById = (req, res) => {
    const { id } = req.params;

    if (req.user.role === 'admin') {
        const allPayments = users.flatMap((u) => u.payments);
        const payment = allPayments.find((p) => p.id === id);
        if (!payment) {
            return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });
        }
        return res.status(200).json({
            message: 'Pembayaran ditemukan',
            data: payment
        });
    }

    const user = users.find((u) => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    const payment = user.payments.find((p) => p.id === id);
    if (!payment) {
        return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });
    }
    return res.status(200).json({
        message: 'Pembayaran ditemukan',
        data: payment
        });
};

// =========================== CANCEL PAYMENT =====================
const cancelPayment = (req, res) => {
    const { paymentId } = req.body;
    const userId = req.user.id;

    if(!paymentId){
        return res.status(400).json({ message: 'paymentId wajib diisi' });
    }
    const user = users.find((u) => u.id === userId);
    if(!user){
        return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const payment = user.payments.find((p) => p.id === paymentId);
    if(!payment){
        return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });
    }

    if(payment.status === 'cancelled' || payment.status === 'refunded'){
        return res.status(400).json({ message: `Pembayaran sudah ${payment.status}` });
    }

    
    switch(payment.paymentMethod.toLowerCase()){
        case 'cash' : payment.status = 'cancelled';
        break;

        case 'transfer':
        case 'qris':
        case 'credit_card':
            payment.status = 'refunded';
            break;

        default:
            return res.status(400).json({ message: 'Metode pembayaran tidak valid' });  
    }
    if (product){
        const selectedSize = product.sizes.find(
            (s) => s.size.toLowerCase() === order.size.toLowerCase()
        );
        if (selectedSize) {
            selectedSize.stock += order.quantity;
        }
    }
    return res.status(200).json({
        message: 'Pembayaran berhasil dibatalkan',
        data: payment
    });
};




module.exports = { createPayment, getPayments, getPaymentById, getAllPayments, cancelPayment };


