const express = require('express');
const {
  createReview,
  getProductReviews,
  deleteReview,
} = require('../controllers/review.controller');
const { protect, admin } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

const reviewValidation = [
  body('productId').isInt().withMessage('Product ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required'),
];

router.post('/', protect, reviewValidation, validate, createReview);
router.get('/product/:productId', getProductReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
