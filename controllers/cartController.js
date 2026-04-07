const Cartitem = require('../schemas/cartitem');

class CartController {
    // Tìm 1 sản phẩm cụ thể trong giỏ
    async findCartItem(userId, computerId) {
        return await Cartitem.findOne({ user: userId, computer: computerId });
    }

    // Tìm theo ID của giỏ hàng
    async findCartItemById(userId, cartitemId) {
        return await Cartitem.findOne({ _id: cartitemId, user: userId });
    }

    // Lấy toàn bộ giỏ hàng của User
    async findCartItemsByUser(userId) {
        return await Cartitem.find({ user: userId }).populate('computer', 'name price image slug stockQuantity');
    }

    // Thêm mới
    async createCartItem(data) {
        const cartItem = new Cartitem(data);
        return await cartItem.save();
    }

    // Cập nhật (Save)
    async updateCartItem(cartItemDocument) {
        return await cartItemDocument.save();
    }

    // Xóa 1 sản phẩm
    async deleteCartItem(userId, cartitemId) {
        return await Cartitem.findOneAndDelete({ _id: cartitemId, user: userId });
    }

    // Xóa trắng giỏ hàng
    async clearCartByUser(userId) {
        return await Cartitem.deleteMany({ user: userId });
    }
}

module.exports = new CartController();