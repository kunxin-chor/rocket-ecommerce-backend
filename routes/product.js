const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /products - View all products (renders HTML)
router.get('/', async (req, res) => {
  try {
    const products = await Product.query();
    res.render('products/index', { products });
  } catch (err) {
    res.status(500).send('Failed to fetch products: ' + err.message);
  }
});

// GET /products/new - Show create product form
router.get('/new', (req, res) => {
  res.render('products/new');
});

// POST /products - Create a new product (redirects)
router.post('/new', async (req, res) => {
  try {
    await Product.query().insert(req.body);
    res.redirect('/products');
  } catch (err) {
    res.status(400).render('products/new', { error: 'Failed to create product: ' + err.message, formData: req.body });
  }
});

module.exports = router;
