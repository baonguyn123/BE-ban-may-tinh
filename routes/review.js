const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const orderController = require('../controllers/orderController');
const computerController = require('../controllers/computerController');
const Review = require('../schemas/review');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/admin/dashboard', authMiddleware, async (req, res) => {
    try {
        const allReviews = await Review.find().populate('computer', 'name slug image');

        let stats = {};

        for (let i = 0; i < allReviews.length; i++) {
            let r = allReviews[i];
            if (!r.computer) continue;

            let compId = r.computer._id.toString();

            if (!stats[compId]) {
                stats[compId] = {
                    computer: r.computer,
                    total: 0,
                    sumScore: 0,
                    stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                };
            }

            stats[compId].total += 1;
            stats[compId].sumScore += r.rating;
            stats[compId].stars[r.rating] += 1;
        }

        let result = Object.values(stats).map(item => {
            return {
                computer: item.computer,
                total: item.total,
                avg: (item.sumScore / item.total).toFixed(1),
                stars: item.stars
            }
        });

        result.sort((a, b) => b.total - a.total);

        res.status(200).json({ stats: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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

router.delete('/admin/product/:computerId', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Quyền truy cập bị từ chối' });
        }

        const { computerId } = req.params;

        await Review.deleteMany({ computer: computerId });
        await computerController.updateComputerById(computerId, {
            totalReviews: 0,
            averageRating: 0
        });

        res.status(200).json({ message: 'Đã dọn dẹp sạch sẽ toàn bộ đánh giá của sản phẩm này!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;