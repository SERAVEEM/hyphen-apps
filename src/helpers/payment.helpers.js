const handlePaymentMethod = (paymentMethod) => {
    switch (paymentMethod.toLowerCase()) {
        case 'transfer':
            return {
                success: true,
                status: 'waiting_confirmation',
                instruction: 'Transfer ke BCA 1234567890 a/n Toko HYPEN, lalu konfirmasi pembayaran'
            };
        case 'qris':
            return {
                success: true,
                status: 'paid',
                instruction: 'Scan QRIS berikut untuk membayar'
            };
        case 'credit_card':
            return {
                success: true,
                status: 'paid',
                instruction: 'Pembayaran kartu kredit berhasil diproses'
            };
        case 'cash':
            return {
                success: true,
                status: 'pending_cod',
                instruction: 'Siapkan uang tunai saat kurir tiba'
            };
        default:
            return{ 
                success : false,
                message : 'Metode pembayaran tidak valid'
            };
    }
};

module.exports = { handlePaymentMethod };