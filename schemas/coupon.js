const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CouponSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['PERCENTAGE', 'FIXED'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    minOrderValue: {
        type: Number,
        default: 0
    },
    maxDiscountAmount: {
        type: Number,
        default: null
    },
    validFrom: {
        type: Date,
        required: true
    },
    validUntil: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usedCount: {
        type: Number,
        default: 0
    },
    userUsageLimit: {
        type: Number,
        default: 1
    },
    applicableUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Nếu mảng này rỗng -> Áp dụng toàn web
    }],
    isActive: {
        type: Boolean,
        default: true // Công tắc bật/tắt
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Coupon', CouponSchema);