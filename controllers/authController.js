const User = require('../schemas/user')
const Role = require('../schemas/role')

class authController {
    // Chỉ tìm kiếm theo Username
    async findUserByUsername(username) {
        return await User.findOne({ username });
    }

    // Tìm kiếm theo Email (Lấy kèm cả password để login)
    async findUserByEmail(email) {
        return await User.findOne({ email }).select('+password').populate('role', 'name');
    }

    // Tìm user theo ID (Có lấy password để đổi pass)
    async findUserById(id) {
        return await User.findById(id).select('+password');
    }

    // Lấy Profile theo ID (Không lấy password)
    async findProfileById(id) {
        return await User.findById(id).select('-password').populate('role', 'name');
    }

    // Tìm Role
    async findRoleByName(name) {
        return await Role.findOne({ name });
    }

    // Tạo mới User
    async createUser(userData) {
        const user = new User(userData);
        return await user.save();
    }

    // Cập nhật thông tin User
    async updateUserById(id, updateData) {
        return await User.findByIdAndUpdate(id, updateData, { new: true })
            .select('-password').populate('role', 'name');
    }

    // Lưu User (Dành cho việc update các trường lẻ tẻ như đổi mật khẩu)
    async saveUser(userDocument) {
        return await userDocument.save();
    }
}

module.exports = new authController();