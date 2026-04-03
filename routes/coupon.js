const express = require('express');
const router = express.Router();
const Order = require('../schemas/order');
const couponController = require('../controllers/couponController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/create', authMiddleware, async function (req, res) {
    try {
        let newCoupon = await couponController.createCoupon(req.body);
        res.send(newCoupon);
    } catch (error) {
        res.status(400).send({ message: "Lỗi tạo mã: " + error.message });
    }
});

router.get('/', authMiddleware, async function (req, res) {
    try {
        let userId = req.user.userId;
        let coupons = await couponController.findActiveCoupons();
        let validCoupons = [];
        let now = Date.now();

        for (let i = 0; i < coupons.length; i++) {
            let c = coupons[i];
            let validFrom = new Date(c.validFrom).getTime();
            let validUntil = new Date(c.validUntil).getTime();

            if (now < validFrom || now > validUntil) continue;
            if (c.usageLimit !== null && c.usedCount >= c.usageLimit) continue;

            if (c.applicableUsers && c.applicableUsers.length > 0) {
                let isApplicable = false;
                for (let j = 0; j < c.applicableUsers.length; j++) {
                    if (c.applicableUsers[j].toString() === userId.toString()) {
                        isApplicable = true;
                        break;
                    }
                }
                if (isApplicable === false) continue;
            }
            validCoupons.push(c);
        }
        res.send(validCoupons);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

router.post('/apply', authMiddleware, async function (req, res) {
    try {
        let { code, orderValue } = req.body;
        let userId = req.user.userId;

        let coupon = await couponController.findCouponByCode(code);

        if (!coupon) return res.status(404).send({ message: "Mã giảm giá không tồn tại" });
        if (coupon.isActive === false) return res.status(400).send({ message: "Mã giảm giá đã bị khóa" });

        let now = Date.now();
        let validFrom = new Date(coupon.validFrom).getTime();
        let validUntil = new Date(coupon.validUntil).getTime();

        if (now < validFrom || now > validUntil) return res.status(400).send({ message: "Mã giảm giá hết hạn" });
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return res.status(400).send({ message: "Mã đã hết lượt dùng" });
        if (orderValue < coupon.minOrderValue) return res.status(400).send({ message: "Chưa đạt giá trị đơn tối thiểu" });

        let userUsedCount = await Order.countDocuments({
            user: userId,
            couponCode: coupon.code,
            status: { $ne: 'CANCELLED' }
        });

        if (userUsedCount >= coupon.userUsageLimit) return res.status(400).send({ message: "Bạn đã hết lượt sử dụng mã này!" });

        if (coupon.applicableUsers && coupon.applicableUsers.length > 0) {
            let isApplicable = false;
            for (let i = 0; i < coupon.applicableUsers.length; i++) {
                if (coupon.applicableUsers[i].toString() === userId.toString()) {
                    isApplicable = true; break;
                }
            }
            if (isApplicable === false) return res.status(400).send({ message: "Bạn không có quyền dùng mã này" });
        }

        let discountAmount = 0;
        if (coupon.discountType === 'FIXED') {
            discountAmount = coupon.discountValue;
        } else if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = orderValue * (coupon.discountValue / 100);
            if (coupon.maxDiscountAmount !== null && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
        }

        res.send({ message: "Áp dụng thành công", discountAmount, couponCode: coupon.code });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;