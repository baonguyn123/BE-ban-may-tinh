const jwt = require('jsonwebtoken');
const User = require('../schemas/user');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Vui lòng đăng nhập để tiếp tục!' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey');
        const user = await User.findById(decoded.userId || decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Tài khoản này không còn tồn tại!' });
        }

        if (user.isLocked === true) {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa! Vui lòng liên hệ Admin.' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ!' });
    }
};

module.exports = authMiddleware;