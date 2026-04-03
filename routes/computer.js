const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const computerController = require('../controllers/computerController');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

router.get('/', async (req, res) => {
  try {
    const computers = await computerController.getAllComputers();
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

    const category = await categoryController.getCategoryBySlug(req.params.slug);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    // Logic filter cơ bản
    let filter = { category: category._id };
    if (min && max) filter.price = { $gte: Number(min), $lte: Number(max) };
    else if (min) filter.price = { $gte: Number(min) };
    else if (max) filter.price = { $lte: Number(max) };

    let sortOption = {};
    if (sort === 'asc') sortOption = { price: 1 };
    else if (sort === 'desc') sortOption = { price: -1 };

    const computers = await computerController.findComputersByFilter(filter, sortOption);
    res.status(200).json(computers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/search/:key', async (req, res) => {
  try {
    const results = await computerController.searchComputersByName(req.params.key);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const computer = await computerController.getComputerBySlug(req.params.slug);
    res.status(200).json(computer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authMiddleware, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    let data = req.body;
    if (req.file) data.image = req.file.filename;
    if (data.specs && typeof data.specs === 'string') {
      data.specs = JSON.parse(data.specs);
    }
    const computer = await computerController.createComputer(data);
    res.status(201).json(computer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:slug', authMiddleware, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    let data = req.body;
    if (req.file) data.image = req.file.filename;
    if (data.specs && typeof data.specs === 'string') {
      data.specs = JSON.parse(data.specs);
    }
    const updated = await computerController.updateComputerBySlug(req.params.slug, data);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:slug/force', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const forced = await computerController.forceDeleteComputer(req.params.slug);
    res.status(200).json(forced);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;