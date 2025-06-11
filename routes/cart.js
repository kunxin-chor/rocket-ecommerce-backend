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
        const { items: cartItems, totalCost } = await cartItemService.getCartWithTotal(req.session.userId);
        res.render('products/cart', { cartItems, totalCost });
    } catch (err) {
        console.log(err);
        req.flash('error', 'Failed to load cart.');
        res.redirect('/products');
    }
});

// POST /cart/product/:id/update-quantity - Update quantity for a cart item
router.post('/product/:id/update-quantity', async (req, res) => {
    if (!req.session.userId) {
        req.flash('error', 'You must be logged in to update your cart.');
        return res.redirect('/users/login');
    }
    const quantity = parseInt(req.body.quantity, 10);
    if (isNaN(quantity) || quantity < 1) {
        req.flash('error', 'Invalid quantity.');
        return res.redirect('/cart');
    }
    try {
        await cartItemService.updateCartItemQuantity(req.session.userId, req.params.id, quantity);
        req.flash('success', 'Cart updated.');
    } catch (err) {
        req.flash('error', 'Failed to update cart.');
    }
    res.redirect('/cart');
});

module.exports = router;
