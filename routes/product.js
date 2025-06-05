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

router.get('/:product_id/update', async (req, res) => {
    const product = await Product.query().findById(req.params.product_id);
    const productForm = createProductForm();
    // populate the form with values from the product
    productForm.fields.name.value = product.name;
    productForm.fields.cost.value = product.cost;
    productForm.fields.description.value = product.description;
    
    res.render("products/update", {
        productForm: productForm.toHTML(bootstrapField),
        product
    })
})

router.post('/:product_id/update', async (req, res) => {
    const product = await Product.query().findById(req.params.product_id);
    const productForm = createProductForm();
    productForm.handle(req,{
        success: async (form) => {
            await Product.query().update({
                name: form.data.name,
                cost: form.data.cost,
                description: form.data.description
            }).where("id", req.params.product_id);
            res.redirect("/products");
        },
        error: (form) => {
            res.render("products/update", {
                productForm: form.toHTML(bootstrapField),
                product
            })
        }
    })
})

router.get('/:product_id/delete', async (req, res) => {
    const product = await Product.query().findById(req.params.product_id);
    res.render("products/delete", { product });
})

router.post('/:product_id/delete', async (req, res) => {
    await Product.query().deleteById(req.params.product_id);
    res.redirect("/products");
})

module.exports = router;
