const Order = require('../schemas/order');
const OrderItem = require('../schemas/orderitem');
const Cartitem = require('../schemas/cartitem');
const Computer = require('../schemas/computer');
const User = require('../schemas/user');
class OrderController {
    async createOrder(req, res) {
        try {
            const userId = req.user.userId;
            const { shippingAddress, phone } = req.body;
            if (!shippingAddress || !phone) {
                return res.status(400).json({ message: 'Vui lòng cung cấp địa chỉ giao hàng và số điện thoại' });
            }
            const cartItem = await Cartitem.find({ user: userId })
                .populate('computer', 'name price image ');
            if (cartItem.length === 0) {
                return res.status(400).json({ message: 'Giỏ hàng của bạn đang trống' });
            }
            const totalPrice = cartItem.reduce(function (sum, item) {
                return sum + (item.quantity * item.computer.price);
            }, 0)
            const order = new Order({
                user: userId,
                shippingAddress,
                phone,
                status: 'PENDING',
                totalAmount: totalPrice
            });
            await order.save();
            const orderItems = cartItem.map(item => {
                return {
                    order: order._id,
                    computer: item.computer._id, 
                    productName: item.computer.name,
                    quantity: item.quantity,
                    price: item.computer.price,
                    image: item.computer.image
                }
            })
            await OrderItem.insertMany(orderItems);
            await Cartitem.deleteMany({ user: userId });
            res.status(200).json({ message: 'Đơn hàng đã được tạo thành công', orderId: order._id });

        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getMyOrders(req, res) {
        try {
            const userId = req.user.userId;
            const { status } = req.query;

            const filter = { user: userId };
            //ví dụ giống với 
            // const person = {
            //     name: "An"
            // };

            // person.age = 20;

            // console.log(person);
            // {
            //          name: "An",
            //         age: 20
            // }
            //filter{
            //     user: userId,
            //     status: status
            // }
            if (status) {
                filter.status = status;
            }

            const orders = await Order.find(filter)
                .populate('user', 'name email fullname')
                .sort({ createdAt: -1 });

            res.status(200).json({ orders });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getOrderDetail(req, res) {
        const { orderId } = req.params;
        const userId = req.user.userId;
        try {
            const order = await Order.findOne({ _id: orderId, user: userId })
                .populate('user', 'name email fullname');
            if (!order) {
                return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
            }
            const orderItem = await OrderItem.find({ order: orderId })
                .populate('computer', 'name price image slug');
            res.status(200).json({ order, orderItem });

        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // lấy tất cả đơn hàng dành cho admin 
    async getAllOrders(req, res) {
        try {
            const orders = await Order.find()
                .populate('user', 'name email fullname')
                .sort({ createdAt: -1 });
            res.status(200).json({ orders });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // cập nhật trạng thái đơn hàng dành cho admin
    async updateOrderStatus(req, res) {
        try {
            const { orderId } = req.params
            const { status } = req.body

            const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
            }
            const order = await Order.findByIdAndUpdate(
                orderId
                , { status }
                , { new: true }
            ).populate('user', 'fullname email phone');
            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            }

            res.status(200).json({
                message: 'Trạng thái đơn hàng đã được cập nhật',
                order
            });


        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async cancelOrder(req, res) {
        try {
            const { orderId } = req.params
            const userId = req.user.userId
            const order = await Order.findOne({ _id: orderId, user: userId })
            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            }
            if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
                return res.status(400).json({ message: 'Không thể hủy đơn hàng ở trạng thái này' });
            }
            order.status = 'CANCELLED'
            await order.save()
            res.status(200).json({ message: 'Đơn hàng đã hủy', order });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    //THỐNG KÊ ĐƠN HÀNG
    async getOrderStats(req, res) {
        try {
            const totalOrder = await Order.countDocuments()
            const totalRevenue = await Order.aggregate([
                { $match: { status: 'DELIVERED' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ])
            const ordersByStatus = await Order.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]);

            res.status(200).json({
                totalOrder,
                totalRevenue: totalRevenue[0]?.total || 0,
                ordersByStatus
            });

        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getOrderDetailAdmin(req, res) {
        try {
             const {orderId} = req.params
             const order = await Order.findById(orderId)
             .populate('user', 'name email fullname')
             if(!order){
                 return res.status(404).json({message: 'Không tìm thấy đơn hàng'})
             }
             const orderItem = await OrderItem.find({order: orderId})
             .populate('computer', 'name price image slug')
             const totalItem = orderItem.map(
                function(item){
                    return {
                        ...item.toObject(),
                        totalPrice: item.quantity * item.computer.price
                    }
                }
             )

             res.status(200).json({order,orderItem:totalItem});
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
module.exports = new OrderController()