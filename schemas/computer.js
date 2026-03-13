const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
mongoose.plugin(slug);
const Schema = mongoose.Schema
const Computer = new Schema({
   name: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    image: {
        type: String
    },

    description: {
        type: String
    },

    stockQuantity: {
        type: Number,
        default: 0
    },
    slug: { type: String, slug: 'name', unique: true },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
         required: true
    }
});
Computer.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all'
},{
    timestamps: true
})
module.exports = mongoose.model('Computer', Computer)