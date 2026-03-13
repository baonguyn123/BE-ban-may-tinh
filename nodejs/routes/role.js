const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// ADMIN - Chỉ admin được tạo role
router.post('/', authMiddleware, authorize('admin'), roleController.create)

//router.get('/', roleController.getAll)
module.exports = router;