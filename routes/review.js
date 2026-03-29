const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

// Chỉ lấy xem (không cần đăng nhập)
router.get('/product/:computerId', reviewController.getProductReviews);

// Phải đăng nhập mới được làm 2 việc này
router.get('/check', authMiddleware, reviewController.checkUserReview);
router.post('/', authMiddleware, reviewController.createOrUpdateReview);

module.exports = router;