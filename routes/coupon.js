const express = require('express');
const router = express.Router();

const Order = require('../schemas/order');
const couponController = require('../controllers/couponController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/create', authMiddleware, async function (req, res, next) {
    try {
        // Trong thực tế bạn có thể check req.user.role == 'admin' ở đây
        let newCoupon = await couponController.CreateCoupon(req.body);
        res.send(newCoupon);
    } catch (error) {
        res.status(400).send({ message: "Lỗi tạo mã: " + error.message });
    }
});

router.get('/', authMiddleware, async function (req, res, next) {
    let userId = req.user.userId;
    let coupons = await couponController.FindActiveCoupons();
    let validCoupons = [];
    let now = Date.now();

    for (let i = 0; i < coupons.length; i++) {
        let c = coupons[i];
        
        // Kiểm tra thời gian hiệu lực
        let validFrom = new Date(c.validFrom).getTime();
        let validUntil = new Date(c.validUntil).getTime();
        if (now < validFrom || now > validUntil) {
            continue; 
        }

        // Kiểm tra giới hạn lượt dùng
        if (c.usageLimit !== null && c.usedCount >= c.usageLimit) {
            continue; 
        }

        // Kiểm tra user có được phép dùng mã này không 
        if (c.applicableUsers && c.applicableUsers.length > 0) {
            let isApplicable = false;
            for (let j = 0; j < c.applicableUsers.length; j++) {
                if (c.applicableUsers[j].toString() === userId.toString()) {
                    isApplicable = true;
                    break;
                }
            }
            if (isApplicable === false) {
                continue; 
            }
        }

        validCoupons.push(c);
    }

    res.send(validCoupons);
});

router.post('/apply', authMiddleware, async function (req, res, next) {
    let code = req.body.code;
    let orderValue = req.body.orderValue; // Tổng tiền giỏ hàng FE gửi lên
    let userId = req.user.userId;

    let coupon = await couponController.FindCouponByCode(code);

    if (!coupon) {
        res.status(404).send({ message: "Mã giảm giá không tồn tại" });
        return;
    }

    if (coupon.isActive === false) {
        res.status(400).send({ message: "Mã giảm giá đã bị khóa" });
        return;
    }

    let now = Date.now();
    let validFrom = new Date(coupon.validFrom).getTime();
    let validUntil = new Date(coupon.validUntil).getTime();

    if (now < validFrom || now > validUntil) {
        res.status(400).send({ message: "Mã giảm giá không trong thời gian sử dụng" });
        return;
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        res.status(400).send({ message: "Mã giảm giá đã hết lượt sử dụng" });
        return;
    }

    if (orderValue < coupon.minOrderValue) {
        res.status(400).send({ message: "Đơn hàng chưa đạt giá trị tối thiểu để dùng mã này" });
        return;
    }

    let userUsedCount = await Order.countDocuments({
        user: userId,
        couponCode: coupon.code,
        status: { $ne: 'CANCELLED' } // Không tính các đơn đã hủy
    });

    if (userUsedCount >= coupon.userUsageLimit) {
        res.status(400).send({ message: "Bạn đã hết lượt sử dụng mã giảm giá này!" });
        return;
    }

    // Kiểm tra user tri ân
    if (coupon.applicableUsers && coupon.applicableUsers.length > 0) {
        let isApplicable = false;
        for (let i = 0; i < coupon.applicableUsers.length; i++) {
            if (coupon.applicableUsers[i].toString() === userId.toString()) {
                isApplicable = true;
                break;
            }
        }
        if (isApplicable === false) {
            res.status(400).send({ message: "Bạn không có quyền sử dụng mã này" });
            return;
        }
    }

    // Tính tiền được giảm
    let discountAmount = 0;
    
    if (coupon.discountType === 'FIXED') {
        discountAmount = coupon.discountValue;
    } 
    else if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = orderValue * (coupon.discountValue / 100);
        if (coupon.maxDiscountAmount !== null && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
        }
    }

    res.send({ 
        message: "Áp dụng mã thành công",
        discountAmount: discountAmount,
        couponCode: coupon.code
    });
});

module.exports = router;