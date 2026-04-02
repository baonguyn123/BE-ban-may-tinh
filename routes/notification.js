// routes/notification.routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Lấy thông báo của user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notifications = await notificationController.getMine(req.user);
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Đánh dấu 1 thông báo đã đọc
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        await notificationController.markAsRead(req.params.id);
        res.status(200).json({ message: 'Đã đọc' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Đánh dấu tất cả đã đọc
router.put('/read-all', authMiddleware, async (req, res) => {
    try {
        await notificationController.markAllAsRead(req.user);
        res.status(200).json({ message: 'Đã đọc tất cả' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;