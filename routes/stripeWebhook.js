const express = require('express');
const router = express.Router();
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Stripe webhook endpoint - must use raw body parser
router.post('/process_payment', express.raw({ type: 'application/json' }), async (req, res) => {
    let payload = req.body;
    let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
    let sigHeader = req.headers['stripe-signature'];
    let event;
    try {
        event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);
        const stripeSession = event.data.object;
        const session = await Stripe.checkout.sessions.retrieve(
            stripeSession.id, {
            expand: ['line_items']
        });
        const lineItems = await Stripe.checkout.sessions.listLineItems(stripeSession.id, {
            expand: ['data.price.product'],
        });
        for (let i of lineItems.data) {
            // TODO: add info to the db
            console.log('Metadata: ', i.price.product.metadata);
        }
    } catch (e) {
        console.log(e.message);
        res.send({ 'error': e.message });
        return;
    }  
    res.send({ received: true });
});

module.exports = router;
