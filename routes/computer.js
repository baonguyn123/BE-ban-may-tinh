// computer.routes.js
const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload');
const computerController = require('../controllers/computer.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// ================= PUBLIC ROUTES =================
router.get('/', async (req, res) => {
  try {
    const computers = await computerController.getAll();
    res.status(200).json(computers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/best-sellers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const bestSellers = await computerController.getBestSellers(limit);
    res.status(200).json(bestSellers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/category/:slug', async (req, res) => {
  try {
    const { min, max, sort } = req.query;
    const computers = await computerController.getByCategory(req.params.slug, min, max, sort);
    res.status(200).json(computers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/search/:key', async (req, res) => {
  try {
    const results = await computerController.search(req.params.key);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// NOTE: Đặt :slug cuối cùng để không override các route khác
router.get('/:slug', async (req, res) => {
  try {
    const computer = await computerController.getBySlug(req.params.slug);
    res.status(200).json(computer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= ADMIN ROUTES =================
router.post(
  '/',
  authMiddleware,
  authorize('admin'),
  upload.single('image'),
  async (req, res) => {
    try {
      const computer = await computerController.create(req.body, req.file);
      res.status(201).json(computer);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

router.put(
  '/:slug',
  authMiddleware,
  authorize('admin'),
  upload.single('image'),
  async (req, res) => {
    try {
      const updated = await computerController.update(req.params.slug, req.body, req.file);
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.delete('/:slug', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const deleted = await computerController.delete(req.params.slug);
    res.status(200).json(deleted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:slug/restore', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const restored = await computerController.restore(req.params.slug);
    res.status(200).json(restored);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:slug/force', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const forced = await computerController.forceDelete(req.params.slug);
    res.status(200).json(forced);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/trash', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const trash = await computerController.getTrash();
    res.status(200).json(trash);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;