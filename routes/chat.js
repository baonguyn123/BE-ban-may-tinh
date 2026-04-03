const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

router.post('/create', authMiddleware, async (req, res) => {
    try {
        let chat = await chatController.findChatByUser(req.user.userId);
        if (!chat) {
            chat = await chatController.createChat({ user: req.user.userId });
        }
        res.status(200).json({ chat });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/send/:chatId', authMiddleware, async (req, res) => {
    try {
        const { content, computerId } = req.body;

        const msgData = {
            chat: req.params.chatId,
            content: content,
            senderRole: req.user.role,
            computer: computerId || null
        };

        const message = await chatController.createMessage(msgData);

        // Cập nhật chat
        await chatController.updateChatById(req.params.chatId, {
            lastMessage: content,
            lastUpdatedAt: Date.now()
        });

        res.status(200).json({ message });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/messages/:chatId', authMiddleware, async (req, res) => {
    try {
        const messages = await chatController.findMessagesByChatId(req.params.chatId);
        res.status(200).json({ messages });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const chats = await chatController.findAllChats();
        res.status(200).json({ chats });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;