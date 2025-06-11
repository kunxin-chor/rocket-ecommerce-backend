const express = require('express');
const router = express.Router();
const cartItemService = require('../services/cartItemService');
const { checkIfAuthenticated } = require('../middlewares');

// POST /cart/product/:id/add - Add a product to the cart
router.post('/product/:id/add', checkIfAuthenticated, async (req, res) => {
    try {
        await cartItemService.addItemToCart(req.session.userId, req.params.id);
        req.flash('success', 'Product added to cart!');
    } catch (err) {
        req.flash('error', 'Failed to add product to cart.');
    }
    res.redirect('/cart');
});
    
// GET /cart - View cart
router.get('/', checkIfAuthenticated, async (req, res) => {
    try {
        const { items: cartItems, totalCost } = await cartItemService.getCartWithTotal(req.session.userId);
        res.render('cart/index', { cartItems, totalCost });
    } catch (err) {
        console.log(err);
        req.flash('error', 'Failed to load cart.');
        res.redirect('/users/profile');
    }
});

// POST /cart/product/:id/update-quantity - Update quantity for a cart item
router.post('/product/:id/update-quantity', checkIfAuthenticated, async (req, res) => {
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

// POST /cart/product/:id/delete - Remove a cart item
router.post('/product/:id/delete', checkIfAuthenticated, async (req, res) => {
    try {
        await cartItemService.removeCartItem(req.session.userId, req.params.id);
        req.flash('success', 'Item removed from cart.');
    } catch (err) {
        req.flash('error', 'Failed to remove item from cart.');
    }
    res.redirect('/cart');
});

module.exports = router;
