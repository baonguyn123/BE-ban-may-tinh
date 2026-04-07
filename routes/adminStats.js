const express = require('express');
const router = express.Router();
const Order = require('../schemas/order');
const Computer = require('../schemas/computer');
const Category = require('../schemas/category');
const User = require('../schemas/user');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

router.get('/overview', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const now = new Date().getTime();
        const oneDayAgo = now - (24 * 60 * 60 * 1000);

        const totalOrders = await Order.countDocuments();
        const totalProducts = await Computer.countDocuments();
        const totalCategories = await Category.countDocuments();
        const totalUsers = await User.countDocuments();

        const allOrders = await Order.find().populate('user', 'fullname email');
        const allUsers = await User.find();

        // Tính doanh thu
        let totalRevenue = 0;
        for (let i = 0; i < allOrders.length; i++) {
            if (allOrders[i].status === 'DELIVERED') {
                totalRevenue = totalRevenue + allOrders[i].totalAmount;
            }
        }

        // Lấy 5 đơn mới nhất
        const recentOrders = await Order.find()
            .populate('user', 'fullname email')
            .sort({ createdAt: -1 })
            .limit(5);

        // User mới
        let newUsers24h = 0;
        for (let i = 0; i < allUsers.length; i++) {
            const userCreatedAt = new Date(allUsers[i].createdAt).getTime();

            if (userCreatedAt >= oneDayAgo) {
                newUsers24h = newUsers24h + 1;
            }
        }

        // User mua hàng (24h)
        let userBuyer = [];
        for (let i = 0; i < allOrders.length; i++) {
            const orderCreatedAt = new Date(allOrders[i].createdAt).getTime();
            if (orderCreatedAt >= oneDayAgo) {
                const userId = allOrders[i].user ? allOrders[i].user._id.toString() : null;
                if (userId !== null && userBuyer.includes(userId) === false) {
                    userBuyer.push(userId);
                }
            }
        }
        const purchasingUsers24h = userBuyer.length;

        res.status(200).json({
            totalRevenue,
            totalOrders,
            totalProducts,
            totalCategories,
            recentOrders,
            userStats: {
                totalUsers,
                newUsers24h,
                purchasingUsers24h,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;