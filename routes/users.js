const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

router.get('/', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const users = await userController.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const newUser = await userController.createUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id/toggle-lock', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const user = await userController.getUserById(req.params.id);
    const currentLockStatus = user.isLocked || false;
    const updatedUser = await userController.updateUserById(req.params.id, { isLocked: !currentLockStatus });
    const message = !currentLockStatus ? 'Đã khóa tài khoản thành công!' : 'Đã mở khóa tài khoản!';

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user.role === 'admin' && req.user.userId === user._id.toString()) {
      return res.status(400).json({ message: 'Bạn không thể tự khóa tài khoản của chính mình!' });
    }

    res.status(200).json({ message: message, user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const updatedUser = await userController.updateUserById(req.params.id, req.body);
    if (!updatedUser) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    if (req.user.userId === req.params.id) {
      return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản của chính mình!' });
    }
    await userController.deleteUserById(req.params.id);
    res.status(200).json({ message: 'Xóa người dùng thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;