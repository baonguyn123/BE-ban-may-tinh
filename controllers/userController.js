const User = require('../schemas/user');

class UserController {
    async createUser(data) {
        const user = new User(data);
        return await user.save();
    }

    async getAllUsers() {
        return await User.find().populate('role', 'name').sort({ createdAt: -1 });
    }

    async getUserById(id) {
        return await User.findById(id).populate('role', 'name');
    }

    async updateUserById(id, data) {
        return await User.findByIdAndUpdate(id, data, { new: true }).populate('role', 'name');
    }

    async deleteUserById(id) {
        return await User.findByIdAndDelete(id);
    }
}

module.exports = new UserController();