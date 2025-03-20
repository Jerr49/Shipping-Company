const express = require('express');
const { createProduct, getProductByTrackingId } = require('../controllers/productController');
const router = express.Router();

// Route to create a product
router.post('/create-product', createProduct);

// Route to get a product by tracking ID
router.get('/:trackingId', getProductByTrackingId);

module.exports = router;
