// category.routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// PUBLIC
router.get('/', async (req, res) => {
    try {
        const categories = await categoryController.getAll();
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/search/:key', async (req, res) => {
    try {
        const result = await categoryController.search(req.params.key);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/search-computers/:key', async (req, res) => {
    try {
        const result = await categoryController.searchWithComputers(req.params.key);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const category = await categoryController.getBySlug(req.params.slug);
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADMIN
router.post('/', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const category = await categoryController.create(req.body);
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:slug', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const category = await categoryController.update(req.params.slug, req.body);
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:slug', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const result = await categoryController.delete(req.params.slug);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/:slug/restore', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const category = await categoryController.restore(req.params.slug);
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:slug/force', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const category = await categoryController.forceDelete(req.params.slug);
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/trash', authMiddleware, authorize('admin'), async (req, res) => {
    try {
        const categories = await categoryController.getTrash();
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;