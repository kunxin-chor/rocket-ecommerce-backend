const express = require('express');
const router = express.Router();
const cartItemService = require('../services/cartItemService');

// POST /cart/product/:id/add - Add a product to the cart
router.post('/product/:id/add', async (req, res) => {
    if (!req.session.userId) {
        req.flash('error', 'You must be logged in to add items to your cart.');
        return res.redirect('/users/login');
    }
    try {
        await cartItemService.addItemToCart(req.session.userId, req.params.id);
        req.flash('success', 'Product added to cart!');
    } catch (err) {
        req.flash('error', 'Failed to add product to cart.');
    }
    res.redirect('/products');
});

// GET /cart - View cart
router.get('/', async (req, res) => {
    if (!req.session.userId) {
        req.flash('error', 'You must be logged in to view your cart.');
        return res.redirect('/users/login');
    }
    try {
        const cartItems = await cartItemService.getCartItemsByUserId(req.session.userId);
        let totalCost = 0;
        for (const item of cartItems) {
            totalCost += (item.product.cost || 0) * item.quantity;
        }
        res.render('products/cart', { cartItems, totalCost });
    } catch (err) {
        console.log(err);
        req.flash('error', 'Failed to load cart.');
        res.redirect('/products');
    }
});

module.exports = router;
