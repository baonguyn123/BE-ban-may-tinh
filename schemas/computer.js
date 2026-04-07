const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
mongoose.plugin(slug);
const Schema = mongoose.Schema;

const Computer = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    image: { type: String },
    description: { type: String },

    // THÔNG SỐ KỸ THUẬT 
    specs: {
        cpu: { type: String },
        main: { type: String },
        ram: { type: String },
        vga: { type: String },
        storage: { type: String },
        psu: { type: String },
        case: { type: String },
        cooling: { type: String },
        monitor: { type: String }
    },

    stockQuantity: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    slug: { type: String, slug: 'name', unique: true },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
},
    {
        timestamps: true
    });

// Cài đặt Plugin xóa mềm
Computer.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all'
});

module.exports = mongoose.model('Computer', Computer);