const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

require('dotenv').config(); // ✅ very important if not already

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'fitaura/users',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        public_id: (req, file) => `user_${Date.now()}`
    },
});
console.log('Cloudinary Storage Configured:', process.env.CLOUDINARY_CLOUD_NAME);
const upload = multer({ storage });
module.exports = upload;
