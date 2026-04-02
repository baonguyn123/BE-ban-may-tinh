// computer.controller.js
const Computer = require('../schemas/computer');
const Category = require('../schemas/category');

class ComputerController {
    async create(data, file) {
        if (file) {
            data.image = file.filename;
        }
        if (data.specs && typeof data.specs === 'string') {
            data.specs = JSON.parse(data.specs);
        }
        const computer = new Computer(data);
        await computer.save();
        return computer;
    }

    async getAll() {
        return await Computer.find().populate('category', 'name slug description');
    }

    async getTrash() {
        return await Computer.findDeleted().populate('category', 'name slug description');
    }

    async getByCategory(slug, min, max, sort) {
        const category = await Category.findOne({ slug });
        if (!category) throw new Error('Không tìm thấy danh mục');

        const filter = { category: category._id };
        if (min && max) filter.price = { $gte: Number(min), $lte: Number(max) };
        else if (min) filter.price = { $gte: Number(min) };
        else if (max) filter.price = { $lte: Number(max) };

        let sortOption = {};
        if (sort === 'asc') sortOption = { price: 1 };
        else if (sort === 'desc') sortOption = { price: -1 };

        return await Computer.find(filter)
            .sort(sortOption)
            .populate('category', 'name slug description');
    }

    async getBySlug(slug) {
        return await Computer.findOne({ slug }).populate('category', 'name slug description');
    }

    async update(slug, data, file) {
        if (file) data.image = file.filename;
        if (data.specs && typeof data.specs === 'string') {
            data.specs = JSON.parse(data.specs);
        }
        return await Computer.findOneAndUpdate({ slug }, data, { new: true });
    }

    async delete(slug) {
        return await Computer.delete({ slug });
    }

    async restore(slug) {
        return await Computer.restore({ slug });
    }

    async forceDelete(slug) {
        return await Computer.findOneAndDelete({ slug });
    }

    async search(key) {
        return await Computer.find({
            name: { $regex: key, $options: 'i' }
        });
    }

    async getBestSellers(limit = 10) {
        return await Computer.find({ stockQuantity: { $gt: 0 } })
            .populate('category', 'name')
            .sort({ soldCount: -1 })
            .limit(limit);
    }
}

module.exports = new ComputerController();