const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const orderController = require('../controllers/orderController');
const computerController = require('../controllers/computerController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/product/:computerId', async (req, res) => {
    try {
        const reviews = await reviewController.findReviewsByFilter({ computer: req.params.computerId });
        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/check', authMiddleware, async (req, res) => {
    try {
        const filter = {
            user: req.user.userId,
            computer: req.query.computerId,
            order: req.query.orderId
        };
        const review = await reviewController.findReview(filter);
        res.status(200).json({ review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { computerId, orderId, rating, comment } = req.body;

        const order = await orderController.findOrder({ _id: orderId, user: userId, status: 'DELIVERED' });
        if (!order) return res.status(400).json({ message: 'Bạn chỉ được đánh giá khi đơn hàng đã giao thành công!' });

        let review = await reviewController.findReview({ user: userId, computer: computerId, order: orderId });

        if (review) {
            const diffDays = Math.ceil(Math.abs(new Date() - new Date(review.createdAt)) / (1000 * 60 * 60 * 24));
            if (diffDays > 30) return res.status(400).json({ message: 'Quá 30 ngày, không thể chỉnh sửa đánh giá.' });

            await reviewController.updateReviewById(review._id, { rating, comment });
        } else {
            await reviewController.createReview({ user: userId, computer: computerId, order: orderId, rating, comment });
        }

        // Tính điểm trung bình basic
        const allReviews = await reviewController.findReviewsByFilter({ computer: computerId });
        let totalScore = 0;
        for (let i = 0; i < allReviews.length; i++) {
            totalScore += allReviews[i].rating;
        }
        let avg = allReviews.length > 0 ? (totalScore / allReviews.length).toFixed(1) : 0;

        await computerController.updateComputerById(computerId, { totalReviews: allReviews.length, averageRating: parseFloat(avg) });

        res.status(200).json({ message: 'Đánh giá thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;