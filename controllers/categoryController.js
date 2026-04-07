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

    async updateCategoryById(id, data) {
        return await Category.findByIdAndUpdate(id, data, { new: true });
    }

    async forceDeleteCategory(slug) {
        return await Category.findOneAndDelete({ slug });
    }

    async searchCategoryByName(name) {
        return await Category.find({ name: { $regex: name, $options: 'i' } });
    }

    async deleteCategoryById(id) {
        return await Category.findByIdAndDelete(id);
    }
}

module.exports = new CategoryController();