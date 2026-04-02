const User = require('../schemas/user')
const Role = require('../schemas/role')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

class authController {

    async register(data) {
        const { username, password, email, fullname, phone, address } = data;

        if (!username || !password || !email || !fullname || !phone || !address) {
            throw new Error('Vui lòng nhập đầy đủ thông tin');
        }

        const userExist = await User.findOne({ $or: [{ username }, { email }] });
        if (userExist) {
            throw new Error('Tên đăng nhập hoặc email đã tồn tại');
        }

        const userRole = await Role.findOne({ name: 'user' });
        if (!userRole) {
            throw new Error('Không tìm thấy role user');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            password: hashedPassword,
            email,
            fullname,
            phone,
            address,
            role: userRole._id,
        });

        await user.save();

        return { message: 'Đăng ký thành công' };
    }

    async login(data) {
        const { email, password, rememberMe } = data;

        const user = await User.findOne({ email })
            .select('+password')
            .populate('role', 'name');

        if (!user) {
            throw new Error('Email hoặc mật khẩu không chính xác');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Email hoặc mật khẩu không chính xác');
        }

        const tokenExpireTime = rememberMe ? '30d' : '1d';

        const token = jwt.sign({
            userId: user._id,
            role: user.role.name
        }, process.env.JWT_SECRET || 'secretKey', { expiresIn: tokenExpireTime });

        return {
            token,
            user: {
                id: user._id,
                email: user.email,
                fullname: user.fullname,
                phone: user.phone,
                address: user.address,
                role: user.role.name,
            }
        };
    }

    async changePassword(userId, data) {
        const { oldPassword, newPassword } = data;

        if (oldPassword === newPassword) {
            throw new Error('Mật khẩu mới không được trùng');
        }

        const user = await User.findById(userId).select('+password');
        if (!user) {
            throw new Error('Không tìm thấy người dùng');
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new Error('Mật khẩu cũ không đúng');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return { message: 'Đổi mật khẩu thành công' };
    }

    async getProfile(userId) {
        const user = await User.findById(userId)
            .select('-password')
            .populate('role', 'name');

        return user;
    }

    async updateProfile(userId, data) {
        const updateData = { ...data };

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
            .select('-password')
            .populate('role', 'name');

        return user;
    }

    async uploadAvatar(userId, file) {
        if (!file) {
            throw new Error('Không có file');
        }

        const avatarUrl = '/images/' + file.filename;

        const user = await User.findByIdAndUpdate(
            userId,
            { avatar: avatarUrl },
            { new: true }
        ).select('-password').populate('role', 'name');

        return {
            message: 'Upload thành công',
            user
        };
    }
}

module.exports = new authController();