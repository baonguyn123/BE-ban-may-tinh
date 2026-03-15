const mongoose = require("mongoose")
const Schema = mongoose.Schema
const OrderItem = new Schema({

    quantity: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true
    },
    
    image: {
        type: String
    },
      productName: {
        type: String,
        required: true
    },

    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },

    computer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Computer",
        required: true
    }

})

module.exports = mongoose.model("OrderItem", OrderItem)