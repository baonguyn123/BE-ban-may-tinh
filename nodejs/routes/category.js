const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// PUBLIC - Ai cũng có thể làm
router.get('/', categoryController.getAll);
router.get('/search/:key', categoryController.search);
router.get('/search-computers/:key', categoryController.searchWithComputers);
router.get('/:slug', categoryController.getBySlug);

// ADMIN - Chỉ admin được làm
router.post('/', authMiddleware, authorize('admin'), categoryController.create);
router.put('/:slug', authMiddleware, authorize('admin'), categoryController.update);
router.delete('/:slug', authMiddleware, authorize('admin'), categoryController.delete);
router.patch('/:slug/restore', authMiddleware, authorize('admin'), categoryController.restore);
router.delete('/:slug/force', authMiddleware, authorize('admin'), categoryController.forceDelete);
router.get('/trash', authMiddleware, authorize('admin'), categoryController.getTrash);

module.exports = router;