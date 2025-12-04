const express = require('express');
const {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} = require('../controllers/brand.controller');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getBrands);
router.get('/:id', getBrandById);
router.post('/', protect, admin, upload.single('logo'), createBrand);
router.put('/:id', protect, admin, upload.single('logo'), updateBrand);
router.delete('/:id', protect, admin, deleteBrand);

module.exports = router;
