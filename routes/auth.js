const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const upload = require('../middlewares/upload');
const authMiddleware = require('../middlewares/authMiddleware')

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const result = await authController.register(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const result = await authController.login(req.body);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// CHANGE PASSWORD
router.put('/change-password', authMiddleware, async (req, res) => {
    try {
        const result = await authController.changePassword(req.user.userId, req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET PROFILE
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await authController.getProfile(req.user.userId);
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE PROFILE
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await authController.updateProfile(req.user.userId, req.body);
        res.json({ user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPLOAD AVATAR
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
    try {
        const result = await authController.uploadAvatar(req.user.userId, req.file);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;