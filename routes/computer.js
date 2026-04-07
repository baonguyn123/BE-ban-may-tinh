const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

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
    const limit = parseInt(req.query.limit) || 20;
    const allComputers = await computerController.getAllComputers();
    let validComputers = [];

    for (let i = 0; i < allComputers.length; i++) {
      if (allComputers[i].stockQuantity > 0) {
        validComputers.push(allComputers[i]);
      }
    }

    // Sắp xếp giảm dần theo số lượng đã bán (soldCount)
    validComputers.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));

    // Cắt lấy đúng số lượng limit yêu cầu 
    const bestSellers = validComputers.slice(0, limit);

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

    const allComputers = await computerController.getAllComputers();
    let result = [];

    for (let i = 0; i < allComputers.length; i++) {
      // Kiểm tra xem sản phẩm có thuộc danh mục này không
      let isMatchCategory = allComputers[i].category && allComputers[i].category._id.toString() === category._id.toString();

      if (isMatchCategory) {
        let price = allComputers[i].price;
        let minPrice = min ? Number(min) : 0;
        let maxPrice = max ? Number(max) : 9999999999;

        // Lọc giá
        if (price >= minPrice && price <= maxPrice) {
          result.push(allComputers[i]);
        }
      }
    }

    if (sort === 'asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'desc') {
      result.sort((a, b) => b.price - a.price);
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/search/:key', async (req, res) => {
  try {
    const searchKey = req.params.key.toLowerCase();
    const allComputers = await computerController.getAllComputers();
    let results = [];

    for (let i = 0; i < allComputers.length; i++) {
      let productName = allComputers[i].name.toLowerCase();

      if (productName.includes(searchKey)) {
        results.push(allComputers[i]);
      }
    }

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

    if (req.file) {
      data.image = req.file.filename;
    }

    if (data.specs && typeof data.specs === 'string') {
      try {
        data.specs = JSON.parse(data.specs);
      } catch (e) {
        data.specs = { info: data.specs };
      }
    }

    const computer = await computerController.createComputer(data);
    res.status(201).json(computer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', authMiddleware, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    let data = req.body;

    if (req.file) {
      data.image = req.file.filename;
    }

    if (data.specs && typeof data.specs === 'string') {
      try {
        data.specs = JSON.parse(data.specs);
      } catch (e) {
        data.specs = { info: data.specs };
      }
    }

    const updated = await computerController.updateComputerById(req.params.id, data);
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const deleted = await computerController.deleteComputerById(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
    }

    if (deleted.image) {
      const fileName = deleted.image.replace('/images/', '').replace(/^\/+/, '');
      const imagePath = path.join(__dirname, '../uploads', fileName);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({ message: 'Xóa thành công', deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;