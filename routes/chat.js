const express = require('express')
const router = express.Router()
const chatController = require('../controllers/chatController')
const authMiddleware = require('../middlewares/authMiddleware')
const authorize = require('../middlewares/authorize');
router.post('/create',authMiddleware,chatController.createChat)
router.post('/send/:chatId',authMiddleware,chatController.sendMessage)
router.get("/messages/:chatId",authMiddleware, chatController.getMessages)
router.get("/",  authMiddleware, authorize('admin'),chatController.getAllChats)
module.exports = router