const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const { Model } = require('objection');

/**
 * Create a review, and update the product's average review score, in a transaction.
 * @param {Object} params
 * @param {number} params.productId
 * @param {number} params.userId
 * @param {number} params.rating
 * @param {string} params.comment
 * @returns {Promise<Review>}
 */
async function createReviewAndUpdateScore({ productId, userId, rating, comment }) {
    return await Model.transaction(Review.knex(), async (trx) => {
        // Insert review
        const review = await Review.query(trx).insert({
            product_id: productId,
            user_id: userId,
            rating,
            comment
        });

        // Recalculate average score
        const avgResult = await Review.query(trx)
            .where('product_id', productId)
            .avg('rating as avg');
        const avg = avgResult[0].avg || 0;

        // Update product
        await Product.query(trx)
            .patch({ average_review_score: avg })
            .where('id', productId);

        return review;
    });
}

/**
 * Get all reviews for a product, including user info
 */
async function getReviewsForProduct(productId) {
    return await Review.query()
        .where('product_id', productId)
        .withGraphFetched('user');
}

/**
 * Get all reviews by a user, including product info
 */
async function getReviewsByUser(userId) {
    return await Review.query()
        .where('user_id', userId)
        .withGraphFetched('product');
}

module.exports = {
    createReviewAndUpdateScore,
    getReviewsForProduct,
    getReviewsByUser
};
