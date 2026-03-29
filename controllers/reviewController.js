const Review = require('../schemas/review');
const Computer = require('../schemas/computer');
const Order = require('../schemas/order');
const OrderItem = require('../schemas/orderitem');

class ReviewController {
    // 1. THÊM HOẶC SỬA ĐÁNH GIÁ
    async createOrUpdateReview(req, res) {
        try {
            const userId = req.user.userId;
            const { computerId, orderId, rating, comment } = req.body;

            // KIỂM TRA 1: Đơn hàng có đúng là của User và đã GIAO THÀNH CÔNG chưa?
            const order = await Order.findOne({ _id: orderId, user: userId, status: 'DELIVERED' });
            if (!order) {
                return res.status(400).json({ message: 'Bạn chỉ được đánh giá khi đơn hàng đã giao thành công!' });
            }

            // KIỂM TRA 2: Sản phẩm này có nằm trong đơn hàng đó không?
            const orderItem = await OrderItem.findOne({ order: orderId, computer: computerId });
            if (!orderItem) {
                return res.status(400).json({ message: 'Sản phẩm không hợp lệ trong đơn hàng này!' });
            }

            // KIỂM TRA 3: User đã từng đánh giá sản phẩm này trong đơn hàng này chưa?
            let review = await Review.findOne({ user: userId, computer: computerId, order: orderId });

            if (review) {
                // NẾU ĐÃ ĐÁNH GIÁ -> Áp dụng luật 30 ngày
                const reviewDate = new Date(review.createdAt);
                const currentDate = new Date();
                const diffTime = Math.abs(currentDate - reviewDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 30) {
                    return res.status(400).json({ message: 'Đã quá 30 ngày kể từ lúc đánh giá. Bạn không thể chỉnh sửa nữa.' });
                }

                review.rating = rating;
                review.comment = comment;
                await review.save();
            } else {
                // NẾU CHƯA ĐÁNH GIÁ -> Tạo mới
                review = new Review({ user: userId, computer: computerId, order: orderId, rating, comment });
                await review.save();
            }

            // BƯỚC QUAN TRỌNG: Tính toán lại Điểm Trung Bình cho Sản phẩm
            const allReviews = await Review.find({ computer: computerId });
            const totalReviews = allReviews.length;
            const averageRating = totalReviews > 0
                ? (allReviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews).toFixed(1)
                : 0;

            // Lưu điểm trung bình vào bảng Computer
            await Computer.findByIdAndUpdate(computerId, {
                totalReviews,
                averageRating: parseFloat(averageRating)
            });

            res.status(200).json({ message: 'Cảm ơn bạn đã đánh giá sản phẩm!', review });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // 2. LẤY DANH SÁCH ĐÁNH GIÁ CHO TRANG CHI TIẾT SẢN PHẨM
    async getProductReviews(req, res) {
        try {
            const { computerId } = req.params;
            const reviews = await Review.find({ computer: computerId })
                .populate('user', 'fullname avatar username') // Lôi tên & avatar người mua ra để hiển thị
                .sort({ updatedAt: -1 }); // Ưu tiên đánh giá mới nhất lên đầu

            res.status(200).json({ reviews });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // 3. KIỂM TRA XEM USER ĐÃ ĐÁNH GIÁ CHƯA (Dùng để hiện form ở trang Đơn hàng)
    async checkUserReview(req, res) {
        try {
            const userId = req.user.userId;
            const { computerId, orderId } = req.query;

            const review = await Review.findOne({ user: userId, computer: computerId, order: orderId });
            res.status(200).json({ review }); // Nếu review là null -> Chưa đánh giá
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new ReviewController();