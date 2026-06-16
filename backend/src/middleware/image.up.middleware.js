const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    const mime = file.mimetype;
    const originalName = file.originalname || '';
    if (allowed.includes(mime) ||
        (mime === 'application/octet-stream' && /\.(jpe?g|png|webp)$/i.test(originalName))) {
        cb(null, true);
    } else {
        cb(new Error(`Format file tidak didukung: ${mime}. Gunakan JPG, PNG, atau WEBP`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // max 2MB
});

module.exports = { upload };