const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Review = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    computer: { type: mongoose.Schema.Types.ObjectId, ref: 'Computer', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }, // Lưu ID đơn hàng để biết đánh giá từ lần mua nào
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
}, {
    timestamps: true // Tự động lưu ngày tạo để tính giới hạn 30 ngày
});

module.exports = mongoose.model('Review', Review);