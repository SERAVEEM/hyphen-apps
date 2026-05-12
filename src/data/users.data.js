const bcrypt = require('bcrypt');
let users = [];

const initAdmin = async () => {
    const adminExists = users.some(user => user.role === 'admin');
    if (adminExists) return;

    const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
    users.push( {
        id: 'admin001',
        username: 'admin123',
        email : 'admin123@gmail.com',
        password : hashedPassword,
        isVerified: true,
        role : 'admin',
        wishlist: [],
        cart: [],
        orders: [],
        payments: []
        
    });
};
module.exports = { users, initAdmin };