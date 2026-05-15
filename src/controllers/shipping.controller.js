const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { users } = require('@/data/users.data');
const { orders } = require('@/data/order.data');
const { products } = require('@/data/product.data');

// Kurir yang tersedia di tier Starter
const SUPPORTED_COURIERS = ['jne', 'sicepat', 'ide', 'sap', 'jnt', 'ninja', 
                            'tiki', 'lion', 'anteraja', 'pos', 'ncs', 'rex', 
                            'rpx', 'sentral', 'star', 'wahana', 'dse'];

const{ shipments } = require('@/data/shipping.data');
const{ rajaongkirGet, rajaongkirPost } = require('@/helpers/shipping.helpers'); 




// ================== GET SEMUA PROVINSI ==================
// GET /shipping/provinces
const getProvinces = async (req, res) => {
    try {
        const { search } = req.query;

        if (!search) {
            return res.status(400).json({ 
                message: 'Parameter search wajib diisi. Contoh: ?search=jawa' 
            });
        }

        const data = await rajaongkirGet('/destination/domestic-destination', { search });
        return res.status(200).json({
            message: 'Daftar provinsi berhasil diambil',
            data,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal mengambil data provinsi',
            error: error.message,
        });
    }
};


// ================== GET SEMUA KOTA ==================
// GET /shipping/cities?province_id=<province_id>&id=<city_id> (semua opsional)
const getCities = async (req, res) => {
    try {
        const { search } = req.query;

        if (!search) {
            return res.status(400).json({ 
                message: 'Parameter search wajib diisi. Contoh: ?search=jakarta' 
            });
        }

        const data = await rajaongkirGet('/destination/domestic-destination', { search });
        return res.status(200).json({
            message: 'Daftar kota berhasil diambil',
            data,
        });
    } catch (error) {
        return res.status(500).json({ 
            message: 'Gagal mengambil data kota', 
            error: error.message 
        });
    }
};

// ================== HITUNG ONGKIR ==================
// POST /shipping/calculate
// Body: { originCityId, destinationCityId, weightGram, courier? }
// weightGram : berat dalam gram, minimal 1000 (1 kg)
// courier    : opsional, default hitung semua kurir (jne, pos, tiki)
// originCityId & destinationCityId: dari endpoint GET /shipping/cities
const calculateShipping = async (req, res) => {
    try {
        const { originCityId, destinationCityId, weightGram, courier } = req.body;

        if (!originCityId || !destinationCityId || !weightGram) {
            return res.status(400).json({
                message: 'originCityId, destinationCityId, dan weightGram harus diisi',
            });
        }

        if (isNaN(weightGram) || Number(weightGram) < 1) {
            return res.status(400).json({
                message: 'weightGram harus berupa angka positif (dalam gram)',
            });
        }

        const courierParam = courier
            ? courier.toLowerCase()
            : SUPPORTED_COURIERS.join(':');

        const data = await rajaongkirPost('/calculate/domestic-cost', {
            origin:      originCityId,
            destination: destinationCityId,
            weight:      Number(weightGram),
            courier:     courierParam,
            price:       'lowest',
        });

        const results = Array.isArray(data) ? data : [data];
        results.sort((a, b) => a.cost - b.cost);

        return res.status(200).json({
            message: 'Kalkulasi ongkir berhasil',
            weightGram: Number(weightGram),
            data: results,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal menghitung ongkir',
            error: error.message,
        });
    }
};


// ================== BUAT ORDER PENGIRIMAN ==================
// POST /shipping/create
// Body: { orderId, addressId, originCityId, destinationCityId, courierCode, service, weightGram, notes? }
const createShipment = async (req, res) => {
    try {
        const {
            orderId,
            addressId,
            courierCode,
            service,
            notes
        } = req.body;
        const userId = req.user.id;

        if (!orderId || !addressId || !courierCode || !service) {
            return res.status(400).json({
                message: 'orderId, addressId, courierCode, dan service harus diisi',
            });
        }

        // Validasi kurir
        if (!SUPPORTED_COURIERS.includes(courierCode.toLowerCase())) {
            return res.status(400).json({
                message: `Kurir '${courierCode}' tidak didukung`,
                supportedCouriers: SUPPORTED_COURIERS,
            });
        }
        // Validasi order milik user
        const order = orders.find((o) => o.id === orderId && o.userId === userId);
        if (!order) {
            return res.status(404).json({ message: 'Order tidak ditemukan' });
        }
        const product = products.find((p) => p.id === order.productId);
        if (!product) {
            return res.status(404).json({ message: 'Product tidak ditemukan' });
        }

        // Validasi alamat milik user
        const user = users.find((u) => u.id === userId);
        const address = user?.addresses?.find((a) => a.id === addressId);
        if (!address) {
            return res.status(404).json({ message: 'Alamat tidak ditemukan' });
        }

        // Cek apakah order sudah punya shipment
        const alreadyShipped = shipments.find((s) => s.orderId === orderId);
        if (alreadyShipped) return res.status(400).json({ message: 'Order ini sudah memiliki pengiriman' });
        const originCityId      = product.originCityId;
        const destinationCityId = address.destinationCityId;
        const weightGram        = product.weight * order.quantity;

        console.log('PAYLOAD KE RAJAONGKIR:', {
        origin:      originCityId,
        destination: destinationCityId,
        weight:      Number(weightGram),
        courier:     courierCode.toLowerCase(),
        price:       'lowest',
});


        // Ambil data ongkir dari RajaOngkir untuk verifikasi service
        const courierResults = await rajaongkirPost('/calculate/domestic-cost', {
            origin: originCityId,
            destination: destinationCityId,
            weight: Number(weightGram),
            courier:courierCode.toLowerCase(),
            price:'lowest'
        });
        console.log('RAW RESULTS:', JSON.stringify(courierResults, null, 2));

        const results = Array.isArray(courierResults) ? courierResults : [courierResults];
        const serviceUpper = service.toUpperCase();
        const selectedCost = results.find((r) => r.service?.toUpperCase() === serviceUpper);

        if (!selectedCost) {
            return res.status(400).json({
                message: `Service '${service}' tidak tersedia untuk kurir ${courierCode}`,
                availableServices: results.map((r) => r.service),
            });
        }

        const shippingCost = selectedCost.cost;
        const etd = selectedCost.etd || '-';

        const newShipment = {
            id: uuidv4(),
            userId,
            orderId,
            addressId,
            originCityId,
            destinationCityId,
            courierCode: courierCode.toLowerCase(),
            courierName: selectedCost.name,
            service: serviceUpper,
            description: selectedCost.service_name,
            weightGram: Number(weightGram),
            shippingCost,
            etd,
            notes: notes ?? null,
            status: 'PENDING', // PENDING → PICKED_UP → IN_TRANSIT → DELIVERED
            statusHistory: [
                {
                    status:    'PENDING',
                    message:   'Pesanan menunggu konfirmasi pengiriman',
                    timestamp: new Date().toISOString(),
                },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        shipments.push(newShipment);

        // Update status order menjadi 'shipped'
        order.status = 'shipped';

        return res.status(201).json({
            message: 'Order pengiriman berhasil dibuat',
            data: newShipment,
        });
    } catch (error) {
        return res.status(500).json({
            
            message: 'Gagal membuat order pengiriman',
            error: error.message,
        });
    }
};


// ================== RIWAYAT PENGIRIMAN USER ==================
// GET /shipping/my-shipments
const getMyShipments = (req, res) => {
    const userId        = req.user.id;
    const userShipments = shipments.filter((s) => s.userId === userId);

    return res.status(200).json({
        message: 'Daftar pengiriman berhasil diambil',
        total:   userShipments.length,
        data:    userShipments,
    });
};


// ================== SEMUA PENGIRIMAN (ADMIN) ==================
// GET /shipping/all-shipments
const getAllShipments = (req, res) => {
    return res.status(200).json({
        message: 'Semua data pengiriman berhasil diambil',
        total:   shipments.length,
        data:    shipments,
    });
};


// ================== UPDATE STATUS PENGIRIMAN (ADMIN) ==================
// PATCH /shipping/:id/status
// Body: { status, message? }
// Status: PENDING | PICKED_UP | IN_TRANSIT | DELIVERED | CANCELLED
const updateShipmentStatus = (req, res) => {
    const { id }              = req.params;
    const { status, message } = req.body;

    const validStatuses = ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status.toUpperCase())) {
        return res.status(400).json({
            message: 'Status tidak valid',
            validStatuses,
        });
    }

    const shipment = shipments.find((s) => s.id === id);
    if (!shipment) {
        return res.status(404).json({ message: 'Shipment tidak ditemukan' });
    }

    shipment.status    = status.toUpperCase();
    shipment.updatedAt = new Date().toISOString();
    shipment.statusHistory.push({
        status: status.toUpperCase(),
        message: message ?? `Status diperbarui ke ${status.toUpperCase()}`,
        timestamp: new Date().toISOString(),
    });

    // Jika DELIVERED, update status order juga
    if (status.toUpperCase() === 'DELIVERED') {
        const order = orders.find((o) => o.id === shipment.orderId);
        if (order) order.status = 'delivered';
    }

    return res.status(200).json({
        message: 'Status pengiriman berhasil diperbarui',
        data:    shipment,
    });
};


module.exports = {
    getProvinces,
    getCities,
    calculateShipping,
    createShipment,
    getMyShipments,
    getAllShipments,
    updateShipmentStatus,
};