const Review = require('../schemas/review');
const Computer = require('../schemas/computer');
const Order = require('../schemas/order');
const OrderItem = require('../schemas/orderitem');

class ReviewController {
    // Trả về review hoặc lỗi, không trả res trực tiếp
    async createOrUpdateReview({ userId, computerId, orderId, rating, comment }) {
        // KIỂM TRA ĐƠN HÀNG
        const order = await Order.findOne({ _id: orderId, user: userId, status: 'DELIVERED' });
        if (!order) throw { status: 400, message: 'Bạn chỉ được đánh giá khi đơn hàng đã giao thành công!' };

        // KIỂM TRA SẢN PHẨM
        const orderItem = await OrderItem.findOne({ order: orderId, computer: computerId });
        if (!orderItem) throw { status: 400, message: 'Sản phẩm không hợp lệ trong đơn hàng này!' };

        // KIỂM TRA REVIEW CŨ
        let review = await Review.findOne({ user: userId, computer: computerId, order: orderId });

        if (review) {
            // Luật 30 ngày
            const reviewDate = new Date(review.createdAt);
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate - reviewDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 30) throw { status: 400, message: 'Đã quá 30 ngày kể từ lúc đánh giá. Bạn không thể chỉnh sửa nữa.' };

            review.rating = rating;
            review.comment = comment;
            await review.save();
        } else {
            review = new Review({ user: userId, computer: computerId, order: orderId, rating, comment });
            await review.save();
        }

        // Cập nhật điểm trung bình
        const allReviews = await Review.find({ computer: computerId });
        const totalReviews = allReviews.length;
        const averageRating = totalReviews > 0
            ? (allReviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews).toFixed(1)
            : 0;

        await Computer.findByIdAndUpdate(computerId, {
            totalReviews,
            averageRating: parseFloat(averageRating)
        });

        return { message: 'Cảm ơn bạn đã đánh giá sản phẩm!', review };
    }

    async getProductReviews(computerId) {
        const reviews = await Review.find({ computer: computerId })
            .populate('user', 'fullname avatar username')
            .sort({ updatedAt: -1 });
        return reviews;
    }

    async checkUserReview({ userId, computerId, orderId }) {
        const review = await Review.findOne({ user: userId, computer: computerId, order: orderId });
        return review; // null nếu chưa đánh giá
    }
}

module.exports = new ReviewController();