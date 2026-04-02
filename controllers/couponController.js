const Coupon = require('../schemas/coupon');

module.exports = {
    FindCouponByCode: async (code) => {
        return await Coupon.findOne({ code: code.toUpperCase() });
    },
    
    FindActiveCoupons: async () => {
        return await Coupon.find({ isActive: true });
    },

    IncrementCouponUsage: async (couponId) => {
        return await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } }, { new: true });
    },

    CreateCoupon: async (couponData) => {
        const coupon = new Coupon(couponData);
        return await coupon.save();
    }
};