const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// User routes
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const orderId = await orderController.createOrder(req.user.userId, req.body);
        res.status(200).json({ message: 'Đơn hàng đã được tạo thành công', orderId });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const orders = await orderController.getMyOrders(req.user.userId, req.query.status);
        res.status(200).json({ orders });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:orderId/detail', authMiddleware, async (req, res) => {
    try {
        const data = await orderController.getOrderDetail(req.user.userId, req.params.orderId);
        res.status(200).json(data);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

router.put('/:orderId/cancel', authMiddleware, async (req, res) => {
    try {
        const order = await orderController.cancelOrder(req.user.userId, req.params.orderId);
        res.status(200).json({ message: 'Đơn hàng đã hủy', order });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Admin routes
router.get('/all', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const orders = await orderController.getAllOrders();
        res.status(200).json({ orders });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:orderId/status', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const order = await orderController.updateOrderStatus(req.params.orderId, req.body.status);
        res.status(200).json({ message: 'Trạng thái đơn hàng đã được cập nhật', order });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/:orderId/detailadmin', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const data = await orderController.getOrderDetailAdmin(req.params.orderId);
        res.status(200).json(data);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

router.get('/stats/overview', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const stats = await orderController.getOrderStats();
        res.status(200).json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;