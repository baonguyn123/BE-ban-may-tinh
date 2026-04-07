const express = require('express');
const router = express.Router();
const Order = require('../schemas/order');
const couponController = require('../controllers/couponController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize'); // Bổ sung quyền Admin

router.post('/', authMiddleware, authorize('admin'), async function (req, res) {
    try {
        let newCoupon = await couponController.createCoupon(req.body);
        res.status(201).send(newCoupon);
    } catch (error) {
        res.status(400).send({ message: "Lỗi tạo mã: " + error.message });
    }
});

router.get('/all', authMiddleware, authorize('admin'), async function (req, res) {
    try {
        let coupons = await couponController.getAllCoupons();
        res.status(200).send(coupons);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

router.put('/:id', authMiddleware, authorize('admin'), async function (req, res) {
    try {
        let updated = await couponController.updateCouponById(req.params.id, req.body);
        if (!updated) return res.status(404).send({ message: "Không tìm thấy mã" });
        res.status(200).send(updated);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

router.delete('/:id', authMiddleware, authorize('admin'), async function (req, res) {
    try {
        let deleted = await couponController.deleteCouponById(req.params.id);
        if (!deleted) return res.status(404).send({ message: "Không tìm thấy mã để xóa" });
        res.status(200).send({ message: "Xóa thành công" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


router.get('/', authMiddleware, async function (req, res) {
    try {
        let userId = req.user.userId;
        let coupons = await couponController.findActiveCoupons();
        let validCoupons = [];
        let now = new Date().getTime(); // Dùng getTime để so sánh số nguyên cho dễ

        for (let i = 0; i < coupons.length; i++) {
            let c = coupons[i];
            let validFrom = new Date(c.validFrom).getTime();
            let validUntil = new Date(c.validUntil).getTime();

            if (now < validFrom || now > validUntil) continue; // Lọc ngày 
            if (c.usageLimit !== null && c.usedCount >= c.usageLimit) continue; // Lọc lượt dùng
            if (c.applicableUsers && c.applicableUsers.length > 0) { // Mã chỉ định
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
        let code = req.body.code;
        let orderValue = req.body.orderValue;
        let userId = req.user.userId;

        let coupon = await couponController.findCouponByCode(code);

        if (!coupon) return res.status(404).send({ message: "Mã giảm giá không tồn tại" });
        if (coupon.isActive === false) return res.status(400).send({ message: "Mã giảm giá đã bị khóa" });

        let now = new Date().getTime();
        let validFrom = new Date(coupon.validFrom).getTime();
        let validUntil = new Date(coupon.validUntil).getTime();

        if (now < validFrom || now > validUntil) return res.status(400).send({ message: "Mã giảm giá hết hạn" }); // Kiểm tra quá hạn
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return res.status(400).send({ message: "Mã đã hết lượt dùng hệ thống" }); // Kiểm tra lượt dùng
        if (orderValue < coupon.minOrderValue) return res.status(400).send({ message: "Chưa đạt giá trị đơn tối thiểu" }); // Kiểm tra giá trị

        // Lấy hết đơn hàng có user dùng mã này 
        let userOrders = await Order.find({ user: userId, couponCode: coupon.code });
        let userUsedCount = 0;

        for (let i = 0; i < userOrders.length; i++) {
            if (userOrders[i].status !== 'CANCELLED') {
                userUsedCount = userUsedCount + 1;
            }
        }

        if (userUsedCount >= coupon.userUsageLimit) return res.status(400).send({ message: "Bạn đã hết lượt sử dụng mã này!" });
        if (coupon.applicableUsers && coupon.applicableUsers.length > 0) {
            let isApplicable = false;
            for (let i = 0; i < coupon.applicableUsers.length; i++) {
                if (coupon.applicableUsers[i].toString() === userId.toString()) {
                    isApplicable = true;
                    break;
                }
            }
            if (isApplicable === false) return res.status(400).send({ message: "Bạn không có quyền dùng mã này" });
        }

        // Tính tiền giảm
        let discountAmount = 0;
        if (coupon.discountType === 'FIXED') {
            discountAmount = coupon.discountValue;
        } else if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = orderValue * (coupon.discountValue / 100);
            if (coupon.maxDiscountAmount !== null && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
        }

        res.send({ message: "Áp dụng thành công", discountAmount: discountAmount, couponCode: coupon.code });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

router.post('/gift', authMiddleware, authorize('admin'), async function (req, res) {
    try {
        let userId = req.body.userId;
        let couponCode = req.body.couponCode;
        let coupon = await couponController.findCouponByCode(couponCode);

        if (!userId || !couponCode) {
            return res.status(400).send({ message: "Vui lòng cung cấp ID người dùng và Mã giảm giá" });
        }

        if (!coupon) {
            return res.status(404).send({ message: "Mã giảm giá này không tồn tại" });
        }
        if (coupon.isActive === false) {
            return res.status(400).send({ message: "Mã giảm giá này đang bị khóa, không thể tặng!" });
        }

        if (!coupon.applicableUsers) {
            coupon.applicableUsers = [];
        }

        let isAlreadyAdded = false;
        for (let i = 0; i < coupon.applicableUsers.length; i++) {
            if (coupon.applicableUsers[i].toString() === userId.toString()) {
                isAlreadyAdded = true;
                break;
            }
        }

        if (isAlreadyAdded === true) {
            return res.status(400).send({ message: "Khách hàng này đã có tên trong danh sách nhận mã!" });
        }
        coupon.applicableUsers.push(userId);
        await couponController.updateCouponById(coupon._id, { applicableUsers: coupon.applicableUsers });

        res.status(200).send({ message: "Đã tặng mã giảm giá cho khách hàng thành công!" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;