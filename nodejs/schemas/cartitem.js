const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Cartitem = new Schema({
     quantity: {
        type: Number,
        required: true,
        default: 1
    },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    computer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Computer',
        required: true
    }
},{
    timestamps: true
});
module.exports = mongoose.model('Cartitem', Cartitem)