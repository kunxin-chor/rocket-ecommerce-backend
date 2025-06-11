const CartItem = require('../models/CartItem');

const createCartItem = async (data) => {
    return await CartItem.query().insert(data);
};

const getCartItemById = async (id) => {
    return await CartItem.query().findById(id);
};

const getCartItemsByUserId = async (userId) => {
    return await CartItem.query().where('user_id', userId).withGraphFetched('product.[category, tags]');
};

const updateCartItem = async (id, data) => {
    return await CartItem.query().patchAndFetchById(id, data);
};

const deleteCartItem = async (id) => {
    return await CartItem.query().deleteById(id);
};

const clearCart = async (userId) => {
    return await CartItem.query().delete().where('user_id', userId);
};

const getCartItemByUserAndProduct = async (userId, productId) => {
    return await CartItem.query()
        .where({ user_id: userId, product_id: productId })
        .first();
};

const getCartItemsWithProductDetailsByUserId = async (userId) => {
    return await CartItem.query()
        .where('user_id', userId)
        .withGraphFetched('product');
};

module.exports = {
    createCartItem,
    getCartItemById,
    getCartItemsByUserId,
    updateCartItem,
    deleteCartItem,
    clearCart,
    getCartItemByUserAndProduct,
    getCartItemsWithProductDetailsByUserId
};
