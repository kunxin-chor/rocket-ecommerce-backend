const express = require('express');
const router = express.Router();
const productDal = require('../../dal/Product');
const { createSearchForm, createProductForm } = require('../../forms');

// GET /api/products - List/search products (stateless, JSON response)
router.get('/', async (req, res) => {
    try {
        
        const categories = await productDal.getAllCategories();
        const categoriesForForm = categories.map(c => [c.id, c.name]);
        const tags = await productDal.getAllTags();
        const tagsForForm = tags.map(t => [t.id, t.name]);
        const searchForm = createSearchForm(categoriesForForm, tagsForForm);

        searchForm.handle(req, {
            empty: () => {
                // No filters provided: return all products or an empty result as appropriate           
                productDal.getAllProducts()
                    .then(products => res.json(products))
                    .catch(err => res.status(500).json({ error: 'Unable to fetch products', details: err.message }));
            },
            error: async (form) => {
                let errors = {};
                for (let key in form.fields) {
                    if (form.fields[key].error) {
                        errors[key] = form.fields[key].error;
                    }
                }
                res.status(400).json(errors);
            },
            success: async (form) => {
                try {                    
                    const products = await productDal.search(form.data);
                    res.json(products);
                } catch (err) {
                    res.status(500).json({ error: 'Unable to fetch products', details: err.message });
                }
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Unable to fetch products', details: err.message });
    }
});

// POST /api/products - Create a new product (stateless, JSON only)
router.post('/', async (req, res) => {
    try {
        const categories = await productDal.getAllCategories();
        const categoriesForForm = categories.map(c => [c.id, c.name]);
        const tags = await productDal.getAllTags();
        const tagsForForm = tags.map(t => [t.id, t.name]);
        const form = createProductForm(categoriesForForm, tagsForForm);

        // Populate form with request body
        form.handle({
            body: req.body,
            files: {},
        }, {
            success: async (form) => {
                // Create product using DAL
                try {
                    const productData = form.data;
                    // tags may need to be processed if your DAL expects array or comma-separated string
                    const newProduct = await productDal.createProduct(productData);
                    res.status(201).json(newProduct);
                } catch (err) {
                    res.status(500).json({ error: 'Failed to create product', details: err.message });
                }
            },
            error: (form) => {
                // Return validation errors
                res.status(400).json({ errors: form.errors });
            },
            empty: () => {
                res.status(400).json({ error: 'No data submitted' });
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Unable to process product creation', details: err.message });
    }
});

module.exports = router;
