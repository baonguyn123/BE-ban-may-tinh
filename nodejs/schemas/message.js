const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Message = new Schema({
      content: {
        type: String,
        required: true
    },
       senderRole: {
        type: String,
        required: true
    },
     chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    }
},{
    timestamps: true
});
module.exports = mongoose.model('Message', Message)