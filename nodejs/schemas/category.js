const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
mongoose.plugin(slug);
const Schema = mongoose.Schema
const Category = new Schema({
    name: {
        type: String,
        required: true
    },
    slug: { type: String, slug: 'name', unique: true },
    description: {
        type: String
    }
});
Category.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all'
}, {
    timestamps: true
})
module.exports = mongoose.model('Category', Category)