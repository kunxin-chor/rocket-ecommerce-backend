const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const express = require('express');
const router = express.Router();
const cartItemService = require('../../services/cartItemService');
const { checkIfAuthenticated } = require('../../middlewares');

router.post('/checkout', checkIfAuthenticated, async (req, res) => {
    try {
     

        // get all the items from the cart
        const { items } = await cartItemService.getCartWithTotal(req.session.userId);

        // step 1 - create line items
        let lineItems = [];

        for (let i of items) {
            const product = i.product;
            const lineItem = {
                quantity: i.quantity,
                price_data: {
                    currency: 'SGD',
                    unit_amount: product.cost,
                    product_data: {
                        name: product.name,
                        metadata: {
                            product_id: i.product_id,
                            quantity: i.quantity
                        }
                    }
                }
            };
            if (product.image_url) {
                lineItem.price_data.product_data.images = [product.image_url];
            }
            lineItems.push(lineItem);
        }

        // step 2 - create stripe payment
        const payment = {
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            success_url: process.env.STRIPE_SUCCESS_URL + '?sessionId={CHECKOUT_SESSION_ID}',
            cancel_url: process.env.STRIPE_ERROR_URL,
            metadata: {
                user_id: req.session.userId
            }
        };

        // step 3: register the session
        let stripeSession = await Stripe.checkout.sessions.create(payment);
        res.render('stripe/checkout', {
            sessionId: stripeSession.id,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        });
    } catch (err) {
        console.error('Stripe checkout error:', err);
        res.status(500).render('stripe/error', {
            message: 'Unable to initiate checkout. Please try again later.'
        });
    }
})

router.get('/success', (req, res) => {
    res.render('stripe/success');
})

router.get('/error', (req, res) => {
    res.render('stripe/error');
})


module.exports = router;
