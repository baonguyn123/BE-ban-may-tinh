const Review = require('../schemas/review');

class ReviewController {
    async findReview(filter) {
        return await Review.findOne(filter).populate('user', 'fullname avatar username');
    }

    async findReviewsByFilter(filter) {
        return await Review.find(filter).populate('user', 'fullname avatar username').sort({ updatedAt: -1 });
    }

    async createReview(data) {
        const review = new Review(data);
        return await review.save();
    }

    async updateReviewById(reviewId, updateData) {
        return await Review.findByIdAndUpdate(reviewId, updateData, { new: true });
    }

    async countReviews(filter) {
        return await Review.countDocuments(filter);
    }
}

module.exports = new ReviewController();