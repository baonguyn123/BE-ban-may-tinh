const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const upload = require('../middlewares/upload');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');


// PUBLIC: Lấy banner
router.get('/', async (req, res) => {
    try {
        const banners = await bannerController.getAll();
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// PRIVATE: Tạo banner
router.post(
    '/',
    authMiddleware,
    authorize('admin'),
    upload.single('image'),
    async (req, res) => {
        try {
            const banner = await bannerController.create(req.body, req.file);
            res.status(201).json(banner);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);

module.exports = router;