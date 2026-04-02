const mongoose = require('mongoose');

// Thông báo dành cho admin hoặc user.
const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Nếu null => Thông báo cho Admin
    title: { type: String, required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' } // Link để click vào chuông thì chuyển trang
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);