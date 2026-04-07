const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
        select: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullname: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        default: 'Chưa biết',
    },
    dob: {
        type: String,
        default: '',
    },
    avatar: {
        type: String,
        default: '',
    },
    role:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    isLocked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('User', User)
