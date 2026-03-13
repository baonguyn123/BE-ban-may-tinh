const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Chat = new Schema({
        closed: {
        type: Boolean,
        default: false
    },
        lastUpdatedAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{
    timestamps: true
});
module.exports = mongoose.model('Chat', Chat)