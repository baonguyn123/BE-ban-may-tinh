const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const upload = require('../middlewares/upload');
const authMiddleware = require('../middlewares/authMiddleware')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

// API ĐĂNG KÝ
router.post('/register', async function (req, res) {
    try {
        const { username, password, email, fullname, phone, address } = req.body;

        if (!username || !password || !email || !fullname || !phone || !address) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin (username, email, password, fullname, phone, address)' });
        }

        const existUsername = await authController.findUserByUsername(username);
        if (existUsername) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        }

        const existEmail = await authController.findUserByEmail(email);
        if (existEmail) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        const userRole = await authController.findRoleByName('user');
        if (!userRole) {
            return res.status(400).json({ message: 'Không tìm thấy role user' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await authController.createUser({
            username,
            password: hashedPassword,
            email,
            fullname,
            phone,
            address,
            role: userRole._id,
        });

        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// API ĐĂNG NHẬP
router.post('/login', async function (req, res) {
    try {
        const { email, password, rememberMe } = req.body;

        const user = await authController.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
        }

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
    catch (error) {res.status(500).json({ message: 'Lỗi server' });
    }
});

// API ĐỔI MẬT KHẨU
router.put('/change-password', authMiddleware, async function (req, res) {
    try {
        const { oldPassword, newPassword } = req.body;
        if (oldPassword === newPassword) {
            return res.status(400).json({ message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại!' });
        }

        const userId = req.user.userId;
        const user = await authController.findUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        
        await authController.saveUser(user);
        res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// API LẤY PROFILE
router.get('/profile', authMiddleware, async function (req, res) {
    try {
        const userId = req.user.userId;
        const user = await authController.findProfileById(userId);
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// API CẬP NHẬT PROFILE
router.put('/profile', authMiddleware, async function (req, res) {
    try {
        const userId = req.user.userId;
        const { fullname, phone, address, gender, dob, avatar } = req.body;

        const updateData = {};
        if (fullname) updateData.fullname = fullname;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;
        if (gender) updateData.gender = gender;
        if (dob) updateData.dob = dob;
        if (avatar) updateData.avatar = avatar;

        const user = await authController.updateUserById(userId, updateData);

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// API UPLOAD AVATAR
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), async function (req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Không tìm thấy file ảnh tải lên' });
        }

        const userId = req.user.userId;
        const avatarUrl = '/images/' + req.file.filename;

        const user = await authController.updateUserById(userId, { avatar: avatarUrl });

        res.status(200).json({
            message: 'Cập nhật ảnh đại diện thành công',
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;