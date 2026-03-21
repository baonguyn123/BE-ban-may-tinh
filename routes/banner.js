const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const upload = require('../middlewares/upload'); // Tận dụng lại bộ upload ảnh của bạn
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// PUBLIC: Ai vào web cũng xem được banner
router.get('/', bannerController.getAll);

// PRIVATE: Chỉ Admin mới được upload banner mới
router.post('/', authMiddleware, authorize('admin'), upload.single('image'), bannerController.create);

module.exports = router;