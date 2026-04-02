// cart.routes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Thêm sản phẩm vào giỏ hàng
router.post('/', authMiddleware, async (req, res) => {
    try {
        const cartItem = await cartController.addToCart(req.user.userId, req.body);
        res.status(200).json({ message: 'Đã thêm sản phẩm vào giỏ hàng', cartItem });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Lấy giỏ hàng
router.get('/', authMiddleware, async (req, res) => {
    try {
        const cart = await cartController.getCart(req.user.userId);
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Cập nhật số lượng
router.put('/:cartitemId', authMiddleware, async (req, res) => {
    try {
        const result = await cartController.updateQuantity(req.user.userId, req.params.cartitemId, req.body.quantity);
        res.status(200).json({ message: 'Cập nhật thành công', ...result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Xóa 1 sản phẩm
router.delete('/:cartitemId', authMiddleware, async (req, res) => {
    try {
        const total = await cartController.removeFromCart(req.user.userId, req.params.cartitemId);
        res.status(200).json({ message: 'Đã xóa sản phẩm', total });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Xóa toàn bộ giỏ hàng
router.delete('/', authMiddleware, async (req, res) => {
    try {
        await cartController.clearCart(req.user.userId);
        res.status(200).json({ message: 'Giỏ hàng đã được làm trống' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;