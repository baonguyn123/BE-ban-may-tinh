const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const Computer = require('../schemas/computer'); // Gọi DB Computer thẳng ở Route
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { computerId, quantity } = req.body;

        let qty = Number(quantity);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
        }

        const computer = await Computer.findById(computerId);
        if (!computer) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        let cartItem = await cartController.findCartItem(userId, computerId);
        if (cartItem) {
            return res.status(400).json({ message: 'Sản phẩm đã có trong giỏ hàng' });
        }

        cartItem = await cartController.createCartItem({ user: userId, computer: computerId, quantity: qty });
        await cartItem.populate('computer', 'name price image slug stockQuantity');

        res.status(200).json({ message: 'Đã thêm sản phẩm vào giỏ hàng', cartItem });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const cartItems = await cartController.findCartItemsByUser(userId);

        let total = 0;
        let items = [];

        // Vòng lặp tính toán basic
        for (let i = 0; i < cartItems.length; i++) {
            let item = cartItems[i];
            if (item.computer) {
                total += item.quantity * item.computer.price;
                items.push({
                    ...item.toObject(),
                    totalPrice: item.quantity * item.computer.price
                });
            }
        }

        // ĐÃ FIX: Trả về chữ "cartItem" để khớp với res.data.cartItem ở Frontend
        res.status(200).json({ cartItem: items, total: total });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

router.put('/:cartitemId', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const cartitemId = req.params.cartitemId;
        let qty = Number(req.body.quantity);

        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
        }

        let cartItem = await cartController.findCartItemById(userId, cartitemId);
        if (!cartItem) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
        }

        cartItem.quantity = qty;
        await cartController.updateCartItem(cartItem);

        res.status(200).json({ message: 'Cập nhật thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

router.delete('/:cartitemId', authMiddleware, async (req, res) => {
    try {
        const deleted = await cartController.deleteCartItem(req.user.userId, req.params.cartitemId);
        if (!deleted) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ' });
        }
        res.status(200).json({ message: 'Đã xóa sản phẩm' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

router.delete('/', authMiddleware, async (req, res) => {
    try {
        await cartController.clearCartByUser(req.user.userId);
        res.status(200).json({ message: 'Giỏ hàng đã được làm trống' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;