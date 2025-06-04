const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { createProductForm, bootstrapField } = require('../forms');

// GET /products - View all products (renders HTML)
router.get('/', async (req, res) => {
  try {
    const products = await Product.query();
    res.render('products/index', { products });
  } catch (err) {
    res.status(500).send('Failed to fetch products: ' + err.message);
  }
});

// GET /products/create - Show create product form
router.get('/create', (req, res) => {
  const productForm = createProductForm();
  res.render('products/create', { productForm: productForm.toHTML(bootstrapField) });
});

// POST /products - Create a new product (redirects)
router.post('/create', async (req, res) => {
    const productForm = createProductForm();
    productForm.handle(req,{
        success: async (form) => {
            await Product.query().insert({
                name: form.data.name,
                cost: form.data.cost,
                description: form.data.description
            })
            res.redirect("/products");
        },
        error: (form) => {
            res.render("products/create", {
                productForm: form.toHTML(bootstrapField)
            })
        }
      })
});

module.exports = router;
