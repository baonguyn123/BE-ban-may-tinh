const Coupon = require('../schemas/coupon');

class CouponController {
    async createCoupon(data) {
        const coupon = new Coupon(data);
        return await coupon.save();
    }

    async getAllCoupons() {
        return await Coupon.find().sort({ createdAt: -1 });
    }

    async findCouponByCode(code) {
        return await Coupon.findOne({ code: code });
    }

    async findActiveCoupons() {
        return await Coupon.find({ isActive: true });
    }

    async deleteCouponById(id) {
        return await Coupon.findByIdAndDelete(id);
    }

    async updateCouponById(couponId, updateData) {
        return await Coupon.findByIdAndUpdate(couponId, updateData, { new: true });
    }
}

module.exports = new CouponController();