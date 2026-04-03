const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const computerController = require('../controllers/computerController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

router.get('/', async (req, res) => {
    try {
        const categories = await categoryController.getAllCategories();
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Tìm kiếm cơ bản (Chỉ tìm theo tên, không dùng $or phức tạp)
router.get('/search/:key', async (req, res) => {
    try {
        const result = await categoryController.searchCategoryByName(req.params.key);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const category = await categoryController.getCategoryBySlug(req.params.slug);
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const category = await categoryController.createCategory(req.body);
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:slug', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const category = await categoryController.updateCategory(req.params.slug, req.body);
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:slug/force', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const category = await categoryController.forceDeleteCategory(req.params.slug);
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;