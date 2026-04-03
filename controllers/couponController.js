const Coupon = require('../schemas/coupon');

class CouponController {
    async findCouponByCode(code) {
        return await Coupon.findOne({ code: code });
    }

    async findActiveCoupons() {
        return await Coupon.find({ isActive: true });
    }

    async updateCouponById(couponId, updateData) {
        return await Coupon.findByIdAndUpdate(couponId, updateData, { new: true });
    }

    async createCoupon(data) {
        const coupon = new Coupon(data);
        return await coupon.save();
    }
}

module.exports = new CouponController();