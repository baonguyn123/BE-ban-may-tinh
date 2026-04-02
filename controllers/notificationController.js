const Notification = require('../schemas/notification');

class NotificationController {
    // Lấy danh sách thông báo
    async getMine(req, res) {
        try {
            // Nếu là admin thì lấy thông báo có user = null, ngược lại lấy theo userId
            const filter = req.user.role === 'admin' ? { user: null } : { user: req.user.userId };
            const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(20);
            res.status(200).json(notifications);
        } catch (error) { res.status(500).json({ message: error.message }); }
    }

    // Đánh dấu 1 cái đã đọc
    async markAsRead(req, res) {
        try {
            await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
            res.status(200).json({ message: 'Đã đọc' });
        } catch (error) { res.status(500).json({ message: error.message }); }
    }

    // 3. Đánh dấu tất cả đã đọc
    async markAllAsRead(req, res) {
        try {
            const filter = req.user.role === 'admin' ? { user: null } : { user: req.user.userId };
            await Notification.updateMany(filter, { isRead: true });
            res.status(200).json({ message: 'Đã đọc tất cả' });
        } catch (error) { res.status(500).json({ message: error.message }); }
    }
}
module.exports = new NotificationController();