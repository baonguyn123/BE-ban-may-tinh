const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const upload = require('../middlewares/upload');
const authMiddleware = require('../middlewares/authMiddleware')
router.post('/register', authController.register)
router.post('/login', authController.login)
router.put('/change-password', authMiddleware, authController.changePassword)
router.get('/profile', authMiddleware, authController.getProfile)
router.put('/profile', authMiddleware, authController.updateProfile)
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), authController.uploadAvatar);
module.exports = router