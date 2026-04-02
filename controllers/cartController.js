// cart.controller.js
const Cartitem = require('../schemas/cartitem');
const Computer = require('../schemas/computer');

class CartController {

    async addToCart(userId, data) {
        const { computerId, quantity } = data;

        if (!quantity || quantity <= 0) {
            throw new Error('Số lượng phải lớn hơn 0');
        }

        const computer = await Computer.findById(computerId);
        if (!computer) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        let cartItem = await Cartitem.findOne({ user: userId, computer: computerId });
        if (cartItem) {
            throw new Error('Sản phẩm đã có trong giỏ hàng');
        }

        cartItem = new Cartitem({ user: userId, computer: computerId, quantity });
        await cartItem.save();
        await cartItem.populate('computer', 'name price image slug');

        return cartItem;
    }

    async getCart(userId) {
        const cartItems = await Cartitem.find({ user: userId }).populate('computer', 'name price image slug');
        const items = cartItems.map(item => ({
            ...item.toObject(),
            totalPrice: item.quantity * item.computer.price
        }));
        const total = cartItems.reduce((sum, item) => sum + item.quantity * item.computer.price, 0);
        return { items, total };
    }

    async updateQuantity(userId, cartitemId, quantity) {
        quantity = Number(quantity);
        if (isNaN(quantity) || quantity <= 0) throw new Error('Số lượng phải là số lớn hơn 0');

        const cartItem = await Cartitem.findOne({ _id: cartitemId, user: userId });
        if (!cartItem) throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');

        cartItem.quantity = quantity;
        await cartItem.save();
        await cartItem.populate('computer', 'name price image slug');

        const totalPrice = cartItem.quantity * cartItem.computer.price;
        const cartItems = await Cartitem.find({ user: userId }).populate('computer', 'price');
        const total = cartItems.reduce((sum, item) => sum + item.quantity * item.computer.price, 0);

        return { cartItem, totalPrice, total };
    }

    async removeFromCart(userId, cartitemId) {
        const cartItem = await Cartitem.findOneAndDelete({ _id: cartitemId, user: userId });
        if (!cartItem) throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');

        const cartItems = await Cartitem.find({ user: userId }).populate('computer', 'price');
        const total = cartItems.reduce((sum, item) => sum + item.quantity * item.computer.price, 0);

        return total;
    }

    async clearCart(userId) {
        await Cartitem.deleteMany({ user: userId });
        return true;
    }
}

module.exports = new CartController();