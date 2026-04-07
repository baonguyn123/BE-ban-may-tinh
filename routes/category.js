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

router.post('/', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
        }

        const category = await categoryController.createCategory(req.body);
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

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

router.put('/:id', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const updatedCategory = await categoryController.updateCategoryById(req.params.id, req.body);

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục để cập nhật' });
        }
        res.status(200).json(updatedCategory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const deletedCategory = await categoryController.deleteCategoryById(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục để xóa' });
        }
        res.status(200).json({ message: 'Đã xóa danh mục thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;