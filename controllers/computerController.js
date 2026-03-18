const Category = require('../schemas/category');
const Computer = require('../schemas/computer');
class ComputerController {
    async create(req, res) {
        try {
            req.body.image = req.file.filename;
            const computer = new Computer(req.body);
            await computer.save();
            res.status(201).json(computer);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async getAll(req, res) {
        try {
            const computer = await Computer.find().populate('category', 'name slug description')
            res.status(200).json(computer);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getTrash(req, res) {
        try {
            const computer = await Computer.findDeleted().populate('category', 'name slug description')
            res.status(200).json(computer);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getByCategory(req, res) {
        try {
            const category = await Category.findOne({ slug: req.params.slug });
            if (!category) {
                return res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }
            const filter = { category: category._id };
            if (min && max) {
                filter.price = { $gte: Number(min), $lte: Number(max) };
            } else if (min) {
                filter.price = { $gte: Number(min) };
            } else if (max) {
                filter.price = { $lte: Number(max) };
            }
            let sortOption = {};
            if (sort === 'asc') {
                sortOption = { price: 1 }; //tăng dần
            } else if (sort === 'desc') {
                sortOption = { price: -1 }; //giảm dần
            }

            const computer = await Computer.find(filter)
                .sort(sortOption)
                .populate('category', 'name slug description')
            res.status(200).json(computer);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getBySlug(req, res) {
        try {
            const computer = await Computer.findOne({ slug: req.params.slug }).populate('category', 'name slug description')
            res.status(200).json(computer);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async update(req, res) {
        try {
            if (req.file) {
                req.body.image = req.file.filename;
            }
            const computer = await Computer.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true });
            res.status(200).json(computer);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async delete(req, res) {
        try {
            const computer = await Computer.delete({ slug: req.params.slug });
            res.status(200).json(computer);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async restore(req, res) {
        try {
            const computer = await Computer.restore({ slug: req.params.slug });
            res.status(200).json(computer);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async forceDelete(req, res) {
        try {
            const computer = await Computer.findOneAndDelete({ slug: req.params.slug });
            res.status(200).json(computer);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async search(req, res) {
        try {
            const data = await Computer.find({
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

}

module.exports = new ComputerController();