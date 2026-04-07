const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Order = new Schema({

    orderDate: {
        type: Date,
        default: Date.now
    },

    totalAmount: {
        type: Number,
        required: true
    },

    shippingAddress: {
        type: String,
        required: true
    },

    couponCode: {
        type: String,
        default: null
    },

    paymentMethod: {
        type: String,
        default: "VNPAY"
    },

    status: {
        type: String,
        enum: ["UNPAID", "PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"],
        default: "UNPAID"
    },

    discountAmount: {
        type: Number,
        default: 0
    },

    phone: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    cancelReason: {
        type: String,
        default: null
    },

}, {
    timestamps: true
})

module.exports = mongoose.model("Order", Order)