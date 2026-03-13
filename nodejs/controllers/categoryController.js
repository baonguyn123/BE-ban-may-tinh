const Category = require('../schemas/category');
 const Computer = require('../schemas/computer');
class CategoryController {
    // [POST] /categories
    async create(req, res) {
        try {
            const category = new Category(req.body);
            await category.save();
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // [GET] /categories
    async getAll(req, res) {
        try {
            const categories = await Category.find();
            res.status(200).json(categories);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // [GET] /categories/:slug
    //lấy categories
    async getBySlug(req, res) {
        try {
            const categories = await Category.findOne({ slug: req.params.slug });
            res.status(200).json(categories);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    //lấy những categories bị xóa mềm 
    async update(req, res) {
        try {
            const category = await Category.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true });
            res.status(200).json(category);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    //xóa mèm
    async delete(req, res) {
        try {
            const category = await Category.delete({ slug: req.params.slug });
            res.status(200).json(category);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // khôi phục
    async restore(req, res) {
        try {
            const category = await Category.restore({ slug: req.params.slug });
            res.status(200).json(category);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // xóa vĩnh viễn
    async forceDelete(req, res) {
        try {
            const category = await Category.findOneAndDelete({ slug: req.params.slug });
            res.status(200).json(category);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getTrash(req, res) {
        try {
            const categories = await Category.findDeleted();
            res.status(200).json(categories);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // Tìm kiếm theo tên hoặc slug
    async search(req, res) {
        try {
           const data = await Category.find({
                $or: [
                    { name: { $regex: req.params.key, $options: 'i' } }
                ]
            });
            res.status(200).json(data);
    }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // Tìm kiếm category và lấy tất cả computer của category đó
    async searchWithComputers(req, res) {
        try {
            const category = await Category.findOne({
                $or: [
                    { name: { $regex: req.params.key, $options: 'i' } },
                    { slug: { $regex: req.params.key, $options: 'i' } }
                ]
            }).select('_id name description slug');
            
            if (!category) {
                return res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }
            
            const computers = await Computer.find({ category: category._id })
            .select('name price image slug -_id')
            .populate('category', 'name slug -_id');
            
            res.status(200).json({
                category,
                computers
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
module.exports = new CategoryController();