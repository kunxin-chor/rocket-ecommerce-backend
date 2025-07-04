const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const { createProductForm, bootstrapField, createSearchForm } = require('../forms');
const { Model } = require('objection');
const { checkIfAuthenticated } = require('../middlewares');

// GET /products - View all products (renders HTML)
router.get('/', async (req, res) => {
    try {

        const categories = await Category.query().select("id", "name");

        const categoriesForForm = categories.map(category => [category.id, category.name]);
        categoriesForForm.unshift(['', 'All Categories']);

        const tags = await Tag.query().select("id", "name");
        const tagsForForm = tags.map(tag => [tag.id, tag.name]);
        const searchForm = createSearchForm(categoriesForForm, tagsForForm);

        // set default values for search form
        searchForm.fields.name.value = req.query.name || "";
        searchForm.fields.min_cost.value = req.query.min_cost || "";
        searchForm.fields.max_cost.value = req.query.max_cost || "";
        searchForm.fields.category_id.value = req.query.category_id || "";
        searchForm.fields.tags.value = req.query.tags || "";

        const query = Product.query().withGraphFetched("[category, tags]");

        // handle search form
        searchForm.handle(req, {
            success: async (form) => {
                if (form.data.name) {
                    query.whereILike("name", `%${form.data.name}%`);
                }
                if (form.data.min_cost) {
                    query.where("cost", ">=", form.data.min_cost);
                }
                if (form.data.max_cost) {
                    query.where("cost", "<=", form.data.max_cost);
                }
                if (form.data.category_id) {
                    query.where("category_id", form.data.category_id);
                }
                if (form.data.tags) {
                    const tagIds = form.data.tags.split(",").map(id => parseInt(id));
                    // query
                    //     .join('products_tags', 'products.id', 'products_tags.product_id')
                    //     .groupBy('products.id')
                    //     .havingRaw('COUNT(DISTINCT CASE WHEN products_tags.tag_id IN (?) THEN products_tags.tag_id END) = ?', [tagIds, tagIds.length])
                    //     .havingRaw('COUNT(DISTINCT products_tags.tag_id) = ?', [tagIds.length])
                    //     .distinct();
                    query
                        .join('products_tags', 'products.id', 'products_tags.product_id')
                        .whereIn('products_tags.tag_id', tagIds)
                        .groupBy('products.id')
                        .havingRaw('COUNT(DISTINCT products_tags.tag_id) = ?', [tagIds.length]);
                }
                const products = await query;
                res.render('products/index', { products, searchForm: searchForm.toHTML(bootstrapField) });
            },
            empty: async (form) => {
                const products = await query;
                res.render('products/index', { products, searchForm: searchForm.toHTML(bootstrapField) });
            },
            error: async (form) => {
                const products = await query;
                res.render('products/index', { products, searchForm: searchForm.toHTML(bootstrapField) });
            }
        })
    } catch (err) {
        res.status(500).send('Failed to fetch products: ' + err.message);
    }
});

// GET /products/create - Show create product form
router.get('/create', checkIfAuthenticated, async (req, res) => {

    // represent each category as [id, name], and all categories as an array
    const categories = await Category.query().select("id", "name");
    const categoriesForForm = categories.map(category => [category.id, category.name]);
    const tags = await Tag.query().select("id", "name");
    const tagsForForm = tags.map(tag => [tag.id, tag.name]);
    const productForm = createProductForm(categoriesForForm, tagsForForm);

    res.render('products/create', {
        productForm: productForm.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    });
});

// POST /products - Create a new product (redirects)
router.post('/create', checkIfAuthenticated, async (req, res) => {
    const categories = await Category.query().select("id", "name");
    const categoriesForForm = categories.map(category => [category.id, category.name]);

    const tags = await Tag.query().select("id", "name");
    const tagsForForm = tags.map(tag => [tag.id, tag.name]);
    const productForm = createProductForm(categoriesForForm, tagsForForm);

    productForm.handle(req, {
        success: async (form) => {
            let transaction = null;
            try {
                transaction = await Model.startTransaction();
                const product = await Product.query(transaction).insert({
                    name: form.data.name,
                    cost: form.data.cost,
                    description: form.data.description,
                    category_id: form.data.category_id,
                    image_url: form.data.image_url
                })
                // Note: Only Postgres and SQL Server support batch insert, so we have to do a for loop
                // and insert each tag one by one
                const tagIds = form.data.tags.split(",").map(id => parseInt(id));
                for (const tagId of tagIds) {
                    await product.$relatedQuery("tags", transaction).relate(tagId);
                }
                await transaction.commit();
                req.flash("success", "Product created successfully");
            } catch (e) {
                await transaction.rollback();
                req.flash("error", "Failed to create product: " + e.message);
                console.log(e);
            } finally {
                res.redirect("/products");
            }
        },
        error: (form) => {
            res.render("products/create", {
                productForm: form.toHTML(bootstrapField),
                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET
            })
        }
    })
});

router.get('/:product_id/update', async (req, res) => {
    const product = await Product.query().findById(req.params.product_id).withGraphFetched("tags");
    const categories = await Category.query().select("id", "name");
    const categoriesForForm = categories.map(category => [category.id, category.name]);
    const tags = await Tag.query().select("id", "name");
    const tagsForForm = tags.map(tag => [tag.id, tag.name]);
    const productForm = createProductForm(categoriesForForm, tagsForForm);
    // populate the form with values from the product
    productForm.fields.name.value = product.name;
    productForm.fields.cost.value = product.cost;
    productForm.fields.description.value = product.description;
    productForm.fields.category_id.value = product.category_id;
    productForm.fields.tags.value = product.tags.map(tag => tag.id);
    productForm.fields.image_url.value = product.image_url;
    res.render("products/update", {
        productForm: productForm.toHTML(bootstrapField),
        product,
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/:product_id/update', async (req, res) => {
    const product = await Product.query().findById(req.params.product_id).withGraphFetched("tags");
    const categories = await Category.query().select("id", "name");
    const categoriesForForm = categories.map(category => [category.id, category.name]);
    const tags = await Tag.query().select("id", "name");
    const tagsForForm = tags.map(tag => [tag.id, tag.name]);
    const productForm = createProductForm(categoriesForForm, tagsForForm);
    productForm.handle(req, {
        success: async (form) => {
            let transaction = null;
            try {
                transaction = await Model.startTransaction();
                await Product.query(transaction).update({
                    name: form.data.name,
                    cost: form.data.cost,
                    description: form.data.description,
                    category_id: form.data.category_id,
                    image_url: form.data.image_url
                }).where("id", req.params.product_id);
                // delete all tags first
                await product.$relatedQuery("tags", transaction).unrelate();

                const tagIds = form.data.tags.split(",").map(id => parseInt(id));
                for (const tagId of tagIds) {
                    await product.$relatedQuery("tags", transaction).relate(tagId);
                }
                await transaction.commit();
            } catch (e) {
                await transaction.rollback();
                console.log(e);
            } finally {
                res.redirect("/products");
            }
        },
        error: (form) => {
            res.render("products/update", {
                productForm: form.toHTML(bootstrapField),
                product,
                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET
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
    req.flash("success", "Product deleted successfully");
    res.redirect("/products");
})

module.exports = router;
