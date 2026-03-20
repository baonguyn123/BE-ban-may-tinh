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

    status: {
        type: String,
        enum: ["UNPAID", "PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"],
        default: "UNPAID"
    },

    shippingAddress: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, {
    timestamps: true
})

module.exports = mongoose.model("Order", Order)