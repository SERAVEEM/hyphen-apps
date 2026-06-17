const cloudinary = require('cloudinary').v2;

const isPlaceholder = (val) => {
    if (!val) return true;
    const lower = val.toLowerCase().replace(/_/g, '-');
    return lower.includes('your-cloudinary');
};

const cloudName = process.env.CLOUDINARY_CLOUD_NAME && !isPlaceholder(process.env.CLOUDINARY_CLOUD_NAME)
    ? process.env.CLOUDINARY_CLOUD_NAME
    : 'dni7b0bxd';

const apiKey = process.env.CLOUDINARY_API_KEY && !isPlaceholder(process.env.CLOUDINARY_API_KEY)
    ? process.env.CLOUDINARY_API_KEY
    : '169732436313457';

const apiSecret = process.env.CLOUDINARY_API_SECRET && !isPlaceholder(process.env.CLOUDINARY_API_SECRET)
    ? process.env.CLOUDINARY_API_SECRET
    : 'quIQhYi9eaOnm2vVwUvA4Kcr0tI';

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});

module.exports = cloudinary;