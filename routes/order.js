const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// Các route yêu cầu đăng nhập
router.post('/create', authMiddleware, orderController.createOrder);
router.get('/my-orders', authMiddleware, orderController.getMyOrders);
router.get('/:orderId/detail', authMiddleware, orderController.getOrderDetail);
router.put('/:orderId/cancel', authMiddleware, orderController.cancelOrder);

// Các route chỉ admin có thể truy cập
router.get('/all', authMiddleware, authorize('admin'), orderController.getAllOrders);
router.put('/:orderId/status', authMiddleware, authorize('admin'), orderController.updateOrderStatus);
router.get('/stats/overview', authMiddleware, authorize('admin'), orderController.getOrderStats);

module.exports = router;
