const Category = require('../schemas/category');

class CategoryController {
    async createCategory(data) {
        const category = new Category(data);
        return await category.save();
    }

    async getAllCategories() {
        return await Category.find();
    }

    async getCategoryBySlug(slug) {
        return await Category.findOne({ slug });
    }

    async updateCategory(slug, data) {
        return await Category.findOneAndUpdate({ slug }, data, { new: true });
    }

    async forceDeleteCategory(slug) {
        return await Category.findOneAndDelete({ slug });
    }

    // Tìm kiếm cơ bản theo tên
    async searchCategoryByName(name) {
        return await Category.find({ name: { $regex: name, $options: 'i' } });
    }
}

module.exports = new CategoryController();