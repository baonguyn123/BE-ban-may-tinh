const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// Public: Lấy danh sách cửa hàng đang hoạt động
router.get('/', async (req, res) => {
    try {
        const stores = await storeController.getActiveStores();
        res.status(200).json(stores);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Admin: Tạo cửa hàng mới
router.post('/', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const { name, address, phone, email, mapLink } = req.body;

        if (!name || !address || !phone || !email || !mapLink) {
            return res.status(400).json({ message: 'Vui lòng điền đủ thông tin cần thiết!' });
        }

        const store = await storeController.createStore(req.body);
        res.status(201).json(store);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Admin: Cập nhật thông tin cửa hàng
router.put('/:id', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const store = await storeController.updateStoreById(req.params.id, req.body);
        if (!store) {
            return res.status(404).json({ message: 'Không tìm thấy cửa hàng' });
        }
        res.status(200).json(store);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Admin: Xóa cửa hàng
router.delete('/:id', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const store = await storeController.deleteStoreById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: 'Không tìm thấy cửa hàng' });
        }
        res.status(200).json({ message: 'Đã xóa cửa hàng' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;