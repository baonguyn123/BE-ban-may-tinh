const Computer = require('../schemas/computer');

class ComputerController {
    async createComputer(data) {
        const computer = new Computer(data);
        return await computer.save();
    }

    async getAllComputers() {
        return await Computer.find().populate('category', 'name slug description');
    }

    async getComputerBySlug(slug) {
        return await Computer.findOne({ slug }).populate('category', 'name slug description');
    }

    async findComputersByFilter(filter, sortOption) {
        return await Computer.find(filter).sort(sortOption).populate('category', 'name slug description');
    }

    async updateComputerBySlug(slug, data) {
        return await Computer.findOneAndUpdate({ slug }, data, { new: true });
    }

    async updateComputerById(id, data) {
        return await Computer.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteComputerById(id) {
        return await Computer.findByIdAndDelete(id);
    }

    async forceDeleteComputer(slug) {
        return await Computer.findOneAndDelete({ slug });
    }

    async searchComputersByName(name) {
        return await Computer.find({ name: { $regex: name, $options: 'i' } });
    }

    async getBestSellers(limitAmount) {
        return await Computer.find({ stockQuantity: { $gt: 0 } }).populate('category', 'name').sort({ soldCount: -1 }).limit(limitAmount);
    }

    async countComputers(filter) {
        return await Computer.countDocuments(filter);
    }

    async getPaginatedComputers(filter, skipAmount, limitAmount) {
        return await Computer.find(filter).populate('category', 'name slug description').sort({ createdAt: -1 }).skip(skipAmount).limit(limitAmount);
    }
}

module.exports = new ComputerController();