const User = require('../schemas/user')
const Role = require('../schemas/role')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
class authController {
    async register(req, res) {
        try {
            const { username, password, email, fullname, phone, address } = req.body;

            // Validate required fields
            if (!username || !password || !email || !fullname || !phone || !address) {
                return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin (username, email, password, fullname, phone, address)' });
            }

            const userExist = await User.findOne({ $or: [{ username }, { email }] });
            if (userExist) {
                return res.status(400).json({ message: 'Tên đăng nhập hoặc email đã tồn tại' });
            }
            const userRole = await Role.findOne({ name: 'user' });
            if (!userRole) {
                return res.status(400).json({ message: 'Không tìm thấy role user' });
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
            res.status(201).json({ message: 'Đăng ký thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
    async login(req, res) {
        try {
            // 1. Lấy thêm rememberMe từ req.body
            const { email, password, rememberMe } = req.body;

            const user = await User.findOne({ email })
                .select('+password')
                .populate('role', 'name');

            // 2. Gộp chung thông báo lỗi để bảo mật (Chống hacker dò email)
            if (!user) {
                return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
            }

            const userPassword = await bcrypt.compare(password, user.password);
            if (!userPassword) {
                return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
            }

            // 3. Logic Remember Me: Nếu true thì token sống 30 ngày, false thì 1 ngày
            const tokenExpireTime = rememberMe ? '30d' : '1d';

            const token = jwt.sign({
                userId: user._id,
                role: user.role.name
            }, process.env.JWT_SECRET || 'secretKey', { expiresIn: tokenExpireTime });

            res.status(200).json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    fullname: user.fullname,
                    phone: user.phone,
                    address: user.address,
                    role: user.role.name,
                }
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    async changePassword(req, res) {
        try {
            const { oldPassword, newPassword } = req.body;
            const userId = req.user.userId
            const user = await User.findById(userId).select('+password');
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();
            res.status(200).json({ message: 'Đổi mật khẩu thành công' });
        }
        catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
    async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const user = await User.findById(userId)
                .select('-password').populate('role', 'name');
            res.status(200).json({ user });
        }
        catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
    async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const { fullname, phone, address } = req.body;

            const updateData = {};
            if (fullname) updateData.fullname = fullname;
            if (phone) updateData.phone = phone;
            // Dòng được thêm vào để fix lỗi không lưu được địa chỉ
            if (address) updateData.address = address;

            const user = await User.findByIdAndUpdate(userId
                , updateData
                , { new: true })
                .select('-password')
                .populate('role', 'name');

            res.status(200).json({ user });
        }
        catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}
module.exports = new authController;