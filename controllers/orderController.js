const Order = require('../schemas/order');
const OrderItem = require('../schemas/orderitem');

class OrderController {
    async createOrder(data) {
        const order = new Order(data);
        return await order.save();
    }

    async createOrderItems(itemsDataArray) {
        return await OrderItem.insertMany(itemsDataArray);
    }

    async findOrderById(orderId) {
        return await Order.findById(orderId).populate('user', 'name email fullname phone');
    }

    async findOrder(filter) {
        return await Order.findOne(filter).populate('user', 'name email fullname phone');
    }

    async findOrdersByFilter(filter) {
        return await Order.find(filter).populate('user', 'name email fullname').sort({ createdAt: -1 });
    }

    async findOrderItemsByOrderId(orderId) {
        return await OrderItem.find({ order: orderId }).populate('computer', 'name price image slug stockQuantity');
    }

    async updateOrderById(orderId, updateData) {
        return await Order.findByIdAndUpdate(orderId, updateData, { new: true }).populate('user', 'fullname email phone');
    }

    async countOrders(filter) {
        return await Order.countDocuments(filter);
    }
}

module.exports = new OrderController();