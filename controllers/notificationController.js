// controllers/notification.controller.js
const Notification = require('../schemas/notification');

class NotificationController {
    // Lấy danh sách thông báo của user/admin
    async getMine(user) {
        const filter = user.role === 'admin' ? { user: null } : { user: user.userId };
        return await Notification.find(filter).sort({ createdAt: -1 }).limit(20);
    }

    // Đánh dấu 1 thông báo đã đọc
    async markAsRead(notificationId) {
        return await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    }

    // Đánh dấu tất cả thông báo đã đọc
    async markAllAsRead(user) {
        const filter = user.role === 'admin' ? { user: null } : { user: user.userId };
        return await Notification.updateMany(filter, { isRead: true });
    }
}

module.exports = new NotificationController();