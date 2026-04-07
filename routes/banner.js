const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const upload = require('../middlewares/upload');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

router.get('/', async (req, res) => {
    try {
        const banners = await bannerController.getAllBanners();
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', authMiddleware, authorize('admin'), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn ảnh' });
        }

        const data = {
            image: req.file.filename,
            type: req.body.type || 'main',
            link: req.body.link || '/products'
        };

        const banner = await bannerController.createBanner(data);
        res.status(201).json(banner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;