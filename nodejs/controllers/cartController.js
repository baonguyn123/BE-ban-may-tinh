const Cartitem = require('../schemas/cartitem');
const Computer = require('../schemas/computer');

class CartController {
    async addToCart(req, res) {

        try {
            const { computerId } = req.body;
            let { quantity } = req.body;
            const userId = req.user.userId;

            // Convert quantity to number and validate
            if (quantity <= 0) {
                return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
            }

            const computer = await Computer.findById(computerId);
            if (!computer) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            }
            let cartItem = await Cartitem.findOne({
                user: userId,
                computer: computerId
            });
            if (cartItem) {
                return res.status(400).json({ message: 'Sản phẩm đã có trong giỏ hàng' });
            }

            cartItem = new Cartitem({
                user: userId,
                computer: computerId,
                quantity
            });
            await cartItem.save();
            await cartItem.populate('computer', 'name price image slug');
            res.status(200).json({
                message: 'Sản phẩm đã được thêm vào giỏ hàng',
                cartItem: cartItem,  // Dùng object đã populate
            });

        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getCart(req, res) {
        try {
            const userId = req.user.userId;
            const cartItem = await Cartitem.find({ user: userId })
                .populate('computer', 'name price image slug');
            //tổng tiền từng sản phẩm 
            const totalOneItem = cartItem.map(
                function (item) {
                    return {
                        ...item.toObject(),
                        totalPrice: item.quantity * item.computer.price,
                    }
                });
            //tổng tiền nhiều sản phẩm
            const total = cartItem.reduce(function (sum, item) {
                return sum + (item.quantity * item.computer.price);
            }, 0)
            res.status(200).json({
                cartItem: totalOneItem
                , total
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async updateQuantity(req, res) {
        try {
            const { cartitemId } = req.params;
            let { quantity } = req.body;
            const userId = req.user.userId;

            // Convert quantity to number and validate
            quantity = Number(quantity);
            if (isNaN(quantity) || quantity <= 0) {
                return res.status(400).json({ message: 'Số lượng phải là số lớn hơn 0' });
            }

            const cartItem = await Cartitem.findOne({ _id: cartitemId, user: userId });
            if (!cartItem) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
            }
            cartItem.quantity = quantity;
            await cartItem.save();
            await cartItem.populate('computer', 'name price image slug');
            //tổng tiền của 1 sản phẩm
            const totalPrice = cartItem.quantity * cartItem.computer.price;
            const cartItems = await Cartitem.find({ user: userId }).populate('computer', 'price');
            //tổng tiền của nhiều sản phẩm
            const totalPrices = cartItems.reduce(function (sum, item) {
                return sum + (item.quantity * item.computer.price);
            }, 0)
            res.status(200).json({
                message: 'Số lượng sản phẩm đã được cập nhật',
                cartItem,
                totalPrice,
                totalPrices
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async removeFromCart(req, res) {
        try {
            const { cartitemId } = req.params;
            const userId = req.user.userId;
            const cartItem = await Cartitem.findOneAndDelete({ _id: cartitemId, user: userId });
            if (!cartItem) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
            }
            const cartItems = await Cartitem
                .find({ user: userId })
                .populate('computer', 'price');
            const total = cartItems.reduce(function (sum, item) {
                return sum + (item.quantity * item.computer.price);
            }, 0)
            res.status(200).json({ message: 'Sản phẩm đã được xóa khỏi giỏ hàng', total });

        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async clearCart(req, res) {
        try {
            const userId = req.user.userId;
            await Cartitem.deleteMany({ user: userId });
            res.status(200).json({ message: 'Giỏ hàng đã được làm trống' });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new CartController();
