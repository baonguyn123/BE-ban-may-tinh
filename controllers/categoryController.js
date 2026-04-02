// category.controller.js
const Category = require('../schemas/category');
const Computer = require('../schemas/computer');

class CategoryController {

    async create(data) {
        const category = new Category(data);
        return await category.save();
    }

    async getAll() {
        return await Category.find();
    }

    async getBySlug(slug) {
        return await Category.findOne({ slug });
    }

    async update(slug, data) {
        return await Category.findOneAndUpdate({ slug }, data, { new: true });
    }

    async delete(slug) {
        return await Category.delete({ slug });
    }

    async restore(slug) {
        return await Category.restore({ slug });
    }

    async forceDelete(slug) {
        return await Category.findOneAndDelete({ slug });
    }

    async getTrash() {
        return await Category.findDeleted();
    }

    async search(key) {
        return await Category.find({
            $or: [
                { name: { $regex: key, $options: 'i' } }
            ]
        });
    }

    async searchWithComputers(key) {
        const category = await Category.findOne({
            $or: [
                { name: { $regex: key, $options: 'i' } },
                { slug: { $regex: key, $options: 'i' } }
            ]
        }).select('_id name description slug');

        if (!category) throw new Error('Không tìm thấy danh mục');

        const computers = await Computer.find({ category: category._id })
            .select('name price image slug -_id')
            .populate('category', 'name slug -_id');

        return { category, computers };
    }
}

module.exports = new CategoryController();