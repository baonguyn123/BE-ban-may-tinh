const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const computerController = require('../controllers/computerController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// PUBLIC - Ai cũng có thể làm
router.get('/', computerController.getAll);
router.get('/category/:slug', computerController.getByCategory);
router.get('/:slug',computerController.getBySlug);
router.get('/search/:key',computerController.search);

// ADMIN - Chỉ admin được làm
router.post('/', authMiddleware, authorize('admin'), upload.single('image'), computerController.create);
router.put('/:slug', authMiddleware, authorize('admin'), upload.single('image'), computerController.update);
router.delete('/:slug', authMiddleware, authorize('admin'), computerController.delete);
router.patch('/:slug/restore', authMiddleware, authorize('admin'), computerController.restore);
router.delete('/:slug/force', authMiddleware, authorize('admin'), computerController.forceDelete);
router.get('/trash', authMiddleware, authorize('admin'), computerController.getTrash);

module.exports = router;