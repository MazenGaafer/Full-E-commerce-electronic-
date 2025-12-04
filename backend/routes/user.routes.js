const express = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
