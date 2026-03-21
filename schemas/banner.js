const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    image: { type: String, required: true },
    type: { type: String, enum: ['main', 'sub'], default: 'main' },
    link: { type: String, default: '/products' } // Đường dẫn khi khách click vào ảnh
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);