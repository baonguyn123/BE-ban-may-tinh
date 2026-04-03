const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const cartController = require('../controllers/cartController');
const computerController = require('../controllers/computerController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

router.post('/create', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { shippingAddress, phone, couponCode, discountAmount } = req.body;

        if (!shippingAddress || !phone) {
            return res.status(400).json({ message: 'Vui lòng cung cấp địa chỉ giao hàng và số điện thoại' });
        }

        // 1. Lấy giỏ hàng
        const cartItems = await cartController.findCartItemsByUser(userId);
        if (cartItems.length === 0) return res.status(400).json({ message: 'Giỏ hàng trống' });

        // 2. Tính tiền và kiểm tra kho
        let totalPrice = 0;
        for (let i = 0; i < cartItems.length; i++) {
            let item = cartItems[i];
            if (item.computer.stockQuantity === 0) return res.status(400).json({ message: `Sản phẩm ${item.computer.name} đã hết hàng` });
            if (item.quantity > item.computer.stockQuantity) return res.status(400).json({ message: `Sản phẩm ${item.computer.name} không đủ số lượng` });
            totalPrice += item.quantity * item.computer.price;
        }

        let finalAmount = totalPrice - (discountAmount || 0);

        // 3. Tạo Order
        const order = await orderController.createOrder({
            user: userId,
            shippingAddress,
            phone,
            status: 'PENDING',
            totalAmount: finalAmount,
            couponCode: couponCode || null,
            discountAmount: discountAmount || 0
        });

        // 4. Tạo Order Items & Trừ kho
        let orderItemsData = [];
        for (let i = 0; i < cartItems.length; i++) {
            let item = cartItems[i];
            orderItemsData.push({
                order: order._id,
                computer: item.computer._id,
                productName: item.computer.name,
                quantity: item.quantity,
                price: item.computer.price,
                image: item.computer.image
            });
            // Trừ stock cơ bản
            await computerController.updateComputerById(item.computer._id, { stockQuantity: item.computer.stockQuantity - item.quantity });
        }
        await orderController.createOrderItems(orderItemsData);

        // 5. Xóa giỏ hàng
        await cartController.clearCartByUser(userId);

        res.status(200).json({ message: 'Đơn hàng tạo thành công', orderId: order._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        let filter = { user: req.user.userId };
        if (req.query.status && req.query.status !== 'ALL') {
            filter.status = req.query.status;
        }

        const orders = await orderController.findOrdersByFilter(filter);

        let result = [];
        for (let i = 0; i < orders.length; i++) {
            let items = await orderController.findOrderItemsByOrderId(orders[i]._id);
            result.push({ ...orders[i].toObject(), orderItems: items });
        }

        res.status(200).json({ orders: result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:orderId/detail', authMiddleware, async (req, res) => {
    try {
        const order = await orderController.findOrder({ _id: req.params.orderId, user: req.user.userId });
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

        const orderItem = await orderController.findOrderItemsByOrderId(req.params.orderId);
        res.status(200).json({ order, orderItem });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:orderId/cancel', authMiddleware, async (req, res) => {
    try {
        const order = await orderController.findOrder({ _id: req.params.orderId, user: req.user.userId });
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

        if (order.status !== 'PENDING' && order.status !== 'CONFIRMED' && order.status !== 'UNPAID') {
            return res.status(400).json({ message: 'Không thể hủy đơn hàng ở trạng thái này' });
        }

        // Hoàn lại kho
        const items = await orderController.findOrderItemsByOrderId(order._id);
        for (let i = 0; i < items.length; i++) {
            await computerController.updateComputerById(items[i].computer._id, { stockQuantity: items[i].computer.stockQuantity + items[i].quantity });
        }

        order.status = 'CANCELLED';
        await order.save();
        res.status(200).json({ message: 'Đơn hàng đã hủy', order });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADMIN ROUTES
router.get('/all', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const orders = await orderController.findOrdersByFilter({});
        res.status(200).json({ orders });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:orderId/status', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const order = await orderController.updateOrderById(req.params.orderId, { status: req.body.status });
        res.status(200).json({ message: 'Cập nhật trạng thái thành công', order });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;