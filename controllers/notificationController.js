const Notification = require('../schemas/notification');

class NotificationController {
    async findNotifications(filter) {
        return await Notification.find(filter).sort({ createdAt: -1 }).limit(20);
    }

    async updateNotificationById(notificationId, updateData) {
        return await Notification.findByIdAndUpdate(notificationId, updateData, { new: true });
    }

    async updateManyNotifications(filter, updateData) {
        return await Notification.updateMany(filter, updateData);
    }

    async createNotification(data) {
        return await Notification.create(data);
    }
}

module.exports = new NotificationController();