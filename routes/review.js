const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewDal = require('../dal/review');
const { checkIfAuthenticated } = require('../middlewares');

// GET /products/:product_id/reviews - List all reviews for a product
router.get('/', async (req, res) => {
    const productId = req.params.product_id;
    try {
        const reviews = await reviewDal.getReviewsForProduct(productId);
        res.render('reviews/index', { reviews, productId });
    } catch (err) {
        res.status(500).send('Failed to fetch reviews: ' + err.message);
    }
});

// POST /products/:product_id/reviews - Add a review for a product
router.post('/', checkIfAuthenticated, async (req, res) => {
    const productId = req.params.product_id;
    const userId = req.session.user && req.session.user.id; // Adjust as per your auth/session
    const { rating, comment } = req.body;
    try {
        await reviewDal.createReviewAndUpdateScore({ productId, userId, rating, comment });
        req.flash('success', 'Review added successfully');
        res.redirect(`/products/${productId}/reviews`);
    } catch (err) {
        req.flash('error', 'Failed to add review: ' + err.message);
        res.redirect(`/products/${productId}/reviews`);
    }
});

module.exports = router;
