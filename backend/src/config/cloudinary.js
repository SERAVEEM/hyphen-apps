const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloudinary-cloud-name'
    ? process.env.CLOUDINARY_CLOUD_NAME
    : 'dni7b0bxd';

const apiKey = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'YOUR_CLOUDINARY_API_KEY' && process.env.CLOUDINARY_API_KEY !== 'your-cloudinary-api-key'
    ? process.env.CLOUDINARY_API_KEY
    : '169732436313457';

const apiSecret = process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET !== 'your-cloudinary-api-secret'
    ? process.env.CLOUDINARY_API_SECRET
    : 'quIQhYi9eaOnm2vVwUvA4Kcr0tI';

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});

module.exports = cloudinary;