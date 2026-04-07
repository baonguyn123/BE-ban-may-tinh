const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// ADMIN - Chỉ admin được tạo role
router.post('/', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const role = await roleController.create(req.body);
        res.status(201).json(role);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Server Error' });
    }
});

// Lấy tất cả role (nếu muốn)
router.get('/', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const roles = await roleController.getAll();
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;