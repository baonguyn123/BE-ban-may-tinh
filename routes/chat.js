// chat.routes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// Tạo chat cho user
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const chat = await chatController.createChat(req.user.userId);
        res.status(200).json({ chat });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Gửi message
router.post('/send/:chatId', authMiddleware, async (req, res) => {
    try {
        const message = await chatController.sendMessage(req.user, req.params.chatId, req.body);
        res.status(200).json({ message });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Lấy messages của 1 chat
router.get('/messages/:chatId', authMiddleware, async (req, res) => {
    try {
        const messages = await chatController.getMessages(req.params.chatId);
        res.status(200).json({ messages });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Lấy tất cả chats (admin)
router.get('/', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const chats = await chatController.getAllChats();
        res.status(200).json({ chats });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;