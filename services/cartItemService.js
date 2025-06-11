const CartItemDal = require('../dal/cartItem');


// Add product to cart: increment quantity if exists, else create
const addItemToCart = async (userId, productId) => {
    // Check if cart item exists
    const item = await CartItemDal.getCartItemByUserAndProduct(userId, productId);
    if (item) {
        // Increment quantity by 1
        return await CartItemDal.updateCartItem(item.id, { quantity: item.quantity + 1 });
    } else {
        // Create new cart item with quantity 1
        return await CartItemDal.createCartItem({ user_id: userId, product_id: productId, quantity: 1 });
    }
};

// Get all cart items for a user (with product details)
const getCartItemsByUserId = async (userId) => {
    return await CartItemDal.getCartItemsByUserId(userId);
};

// Update quantity for a cart item
const updateCartItemQuantity = async (userId, productId, quantity) => {
    const item = await CartItemDal.getCartItemByUserAndProduct(userId, productId);
    if (!item) throw new Error('Cart item not found');
    return await CartItemDal.updateCartItem(item.id, { quantity });
};

// Remove a cart item
const removeCartItem = async (userId, productId) => {
    const item = await CartItemDal.getCartItemByUserAndProduct(userId, productId);
    if (!item) throw new Error('Cart item not found');
    return await CartItemDal.deleteCartItem(item.id);
};

// Clear all cart items for a user
const clearCart = async (userId) => {
    return await CartItemDal.clearCart(userId);
};

// Get cart summary (total items, total cost)
const getCartSummary = async (userId) => {
    const items = await CartItemDal.getCartItemsByUserId(userId);
    let totalQuantity = 0;
    let totalCost = 0;
    for (const item of items) {
        const product = await CartItemDal.getCartItemByUserAndProduct(userId, item.product_id);
        totalQuantity += item.quantity;
        totalCost += (product.cost || 0) * item.quantity;
    }
    return { totalQuantity, totalCost };
};

module.exports = {
    addItemToCart,
    getCartItemsByUserId,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    getCartSummary
};

