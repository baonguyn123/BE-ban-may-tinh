const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Payment = new Schema({

    transactionId: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    paymentDate: {
        type: Date,
        default: Date.now
    },

    paymentMethod: {
        type: String,
        enum: ["COD", "VNPAY", "MOMO", "BANK"],
        required: true
    },

    status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED"],
        default: "PENDING"
    },
    refundStatus: {
        type: String,
        enum: ["NONE", "REFUNDED"],
        default: "NONE"
    },
    refundAt: {
        type: Date
    },

    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        unique: true
    }

}, {
    timestamps: true
})

module.exports = mongoose.model("Payment", Payment)