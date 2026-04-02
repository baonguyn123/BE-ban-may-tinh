// controllers/order.controller.js
const Order = require('../schemas/order');
const OrderItem = require('../schemas/orderitem');
const Cartitem = require('../schemas/cartitem');
const Computer = require('../schemas/computer');
const Payment = require('../schemas/payment');

class OrderController {
    // Tạo đơn hàng
    async createOrder(userId, data) {
        const { shippingAddress, phone, couponCode, discountAmount } = data;

        if (!shippingAddress || !phone) throw new Error('Vui lòng cung cấp địa chỉ giao hàng và số điện thoại');

        const cartItems = await Cartitem.find({ user: userId })
            .populate('computer', 'name price image stockQuantity');

        if (!cartItems.length) throw new Error('Giỏ hàng của bạn đang trống');

        let totalPrice = 0;

        for (const item of cartItems) {
            if (item.computer.stockQuantity === 0)
                throw new Error(`Sản phẩm ${item.computer.name} đã hết hàng`);
            if (item.quantity > item.computer.stockQuantity)
                throw new Error(`Sản phẩm ${item.computer.name} chỉ còn ${item.computer.stockQuantity}`);
            totalPrice += item.quantity * item.computer.price;
        }

        const finalAmount = totalPrice - (discountAmount || 0);

        const order = new Order({ user: userId, shippingAddress, phone, status: 'PENDING', totalAmount: totalPrice });
        await order.save();

        const orderItems = cartItems.map(item => ({
            order: order._id,
            computer: item.computer._id,
            productName: item.computer.name,
            quantity: item.quantity,
            price: item.computer.price,
            image: item.computer.image
        }));

        await OrderItem.insertMany(orderItems);

        for (const item of cartItems) {
            await Computer.findByIdAndUpdate(item.computer._id, { $inc: { stockQuantity: -item.quantity } });
        }

        await Cartitem.deleteMany({ user: userId });

        return order._id;
    }

    // Lấy đơn hàng của user
    async getMyOrders(userId, status) {
        const filter = { user: userId };
        if (status && status !== 'ALL') filter.status = status;

        const orders = await Order.find(filter).populate('user', 'name email fullname').sort({ createdAt: -1 }).lean();

        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const items = await OrderItem.find({ order: order._id }).populate('computer', 'name image price slug');
                return { ...order, orderItems: items };
            })
        );

        return ordersWithItems;
    }

    // Lấy chi tiết đơn hàng của user
    async getOrderDetail(userId, orderId) {
        const order = await Order.findOne({ _id: orderId, user: userId }).populate('user', 'name email fullname');
        if (!order) throw new Error('Đơn hàng không tồn tại');

        const orderItems = await OrderItem.find({ order: orderId }).populate('computer', 'name price image slug');
        return { order, orderItems };
    }

    // Các phương thức admin (getAllOrders, updateOrderStatus, getOrderDetailAdmin, getOrderStats)
    async getAllOrders() {
        return await Order.find().populate('user', 'name email fullname').sort({ createdAt: -1 });
    }

    async updateOrderStatus(orderId, status) {
        const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) throw new Error('Trạng thái không hợp lệ');

        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true }).populate('user', 'fullname email phone');
        if (!order) throw new Error('Không tìm thấy đơn hàng');

        if (status === 'DELIVERED') {
            const orderItems = await OrderItem.find({ order: orderId });
            for (const item of orderItems) {
                await Computer.findByIdAndUpdate(item.computer, { $inc: { stock: item.quantity } });
            }
        }

        return order;
    }

    async cancelOrder(userId, orderId) {
        const order = await Order.findOne({ _id: orderId, user: userId });
        const payment = await Payment.findOne({ order: orderId });
        if (!order) throw new Error('Không tìm thấy đơn hàng');

        if (!['PENDING', 'CONFIRMED', 'UNPAID'].includes(order.status))
            throw new Error('Không thể hủy đơn hàng ở trạng thái này');

        const orderItems = await OrderItem.find({ order: orderId });
        for (const item of orderItems) {
            await Computer.findByIdAndUpdate(item.computer, { $inc: { stockQuantity: item.quantity } });
        }

        order.status = 'CANCELLED';
        await order.save();

        if (payment?.status === 'SUCCESS' && payment.refundStatus !== 'REFUNDED') {
            payment.refundStatus = 'REFUNDED';
            payment.refundAt = new Date();
            await payment.save();
        }

        return order;
    }

    async getOrderStats() {
        const totalOrder = await Order.countDocuments();
        const totalRevenueData = await Order.aggregate([
            { $match: { status: 'DELIVERED' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const ordersByStatus = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

        return {
            totalOrder,
            totalRevenue: totalRevenueData[0]?.total || 0,
            ordersByStatus
        };
    }

    async getOrderDetailAdmin(orderId) {
        const order = await Order.findById(orderId).populate('user', 'name email fullname');
        if (!order) throw new Error('Không tìm thấy đơn hàng');

        const orderItems = await OrderItem.find({ order: orderId }).populate('computer', 'name price image slug');
        const totalItem = orderItems.map(item => ({ ...item.toObject(), totalPrice: item.quantity * item.computer.price }));

        return { order, orderItem: totalItem };
    }
}

module.exports = new OrderController();