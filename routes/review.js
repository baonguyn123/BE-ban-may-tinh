const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

// Lấy danh sách review (không cần đăng nhập)
router.get('/product/:computerId', async (req, res) => {
    try {
        const reviews = await reviewController.getProductReviews(req.params.computerId);
        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Kiểm tra user đã đánh giá chưa (cần đăng nhập)
router.get('/check', authMiddleware, async (req, res) => {
    try {
        const review = await reviewController.checkUserReview({
            userId: req.user.userId,
            computerId: req.query.computerId,
            orderId: req.query.orderId
        });
        res.status(200).json({ review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Thêm hoặc sửa review (cần đăng nhập)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const result = await reviewController.createOrUpdateReview({
            userId: req.user.userId,
            computerId: req.body.computerId,
            orderId: req.body.orderId,
            rating: req.body.rating,
            comment: req.body.comment
        });
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Server Error' });
    }
});

module.exports = router;