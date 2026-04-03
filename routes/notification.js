const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
    try {
        let filter = req.user.role === 'admin' ? { user: null } : { user: req.user.userId };
        const notifications = await notificationController.findNotifications(filter);
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        await notificationController.updateNotificationById(req.params.id, { isRead: true });
        res.status(200).json({ message: 'Đã đọc' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/read-all', authMiddleware, async (req, res) => {
    try {
        let filter = req.user.role === 'admin' ? { user: null } : { user: req.user.userId };
        await notificationController.updateManyNotifications(filter, { isRead: true });
        res.status(200).json({ message: 'Đã đọc tất cả' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;