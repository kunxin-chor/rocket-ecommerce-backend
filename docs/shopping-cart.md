# The Cart Data Layer
The data layer will contain all the functions that allows us to:
* Get all the cart items of a user
* Add a product to a user's shopping cart
* Remove a product from the user's shopping cart
* Change the quantity of a item in the user's shopping cart

Inside the `dal` folder, create a new file named cart_items.js. We begin with a function that allows us to get the items of a user's shopping cart. The function simply takes in one argument, the id of a user, and returns all the items in the cart.

```javascript
const getCartItemsByUserId = async (userId) => {
    return await CartItem.query().where('user_id', userId).withGraphFetched('product.[category, tags]');
};
```

* The `withGraphFetched` function is used to fetch related data in a single query, which is more efficient than making multiple queries to the database.
* The `product.[category, tags]` argument is used to fetch the related data for the product, category, and tags. This is known as a *relation expression* and it is a way to specify which related data should be fetched.

#### Creating a Cart Item

To add a new product to a user's cart, we need a function that inserts a new record into the cart items table. This function should take an object containing the necessary data (such as `user_id`, `product_id`, and `quantity`).

```javascript
const createCartItem = async (data) => {
    return await CartItem.query().insert(data);
};
```

* The `data` parameter should include all the fields required to create a cart item.
* The function returns the newly created cart item.

#### Getting a Cart Item by ID

Sometimes, we need to retrieve a specific cart item using its unique ID. The following function accomplishes this:

```javascript
const getCartItemById = async (id) => {
    return await CartItem.query().findById(id);
};
```

* The `id` argument is the unique identifier for the cart item.
* This function is useful for operations where you need to fetch or update a specific cart item.

#### Updating a Cart Item

To change the quantity or other details of a cart item, we use the following function:

```javascript
const updateCartItem = async (id, data) => {
    return await CartItem.query().patchAndFetchById(id, data);
};
```

* The `id` parameter specifies which cart item to update.
* The `data` object contains the fields to be updated (e.g., `{ quantity: 3 }`).
* The `patchAndFetchById` function differs from `updateAndFetchById` in that it only updates the specified fields, while `updateAndFetchById` updates all fields.
* The function returns the updated cart item.

#### Deleting a Cart Item

To remove a product from the user's shopping cart, we use the following function:

```javascript
const deleteCartItem = async (id) => {
    return await CartItem.query().deleteById(id);
};
```

* The `id` parameter is the unique identifier of the cart item to be deleted.
* This function will permanently remove the item from the cart.

#### Clearing the Cart

If we want to remove all items from a user's shopping cart (for example, after a successful checkout), we can use the following function:

```javascript
const clearCart = async (userId) => {
    return await CartItem.query().delete().where('user_id', userId);
};
```

* The `userId` parameter specifies whose cart should be cleared.
* This function deletes all cart items belonging to the given user.

#### Getting a Cart Item by User and Product

To check if a user already has a specific product in their cart, we can use this function:

```javascript
const getCartItemByUserAndProduct = async (userId, productId) => {
    return await CartItem.query()
        .where({ user_id: userId, product_id: productId })
        .first();
};
```

* The function returns the cart item if it exists, or `null` if it does not.
* This is useful to prevent duplicate entries for the same product in the cart.

#### Getting Cart Items with Product Details

If you want to get all cart items for a user, including product information (but not category or tags), use the following function:

```javascript
const getCartItemsWithProductDetailsByUserId = async (userId) => {
    return await CartItem.query()
        .where('user_id', userId)
        .withGraphFetched('product');
};
```

* This function is similar to `getCartItemsByUserId`, but only fetches the product details.

#### Exporting the Functions

At the end of the file, export all the functions so they can be used in other parts of the application:

```javascript
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
```

With these functions, the data access layer for the shopping cart is complete. Each function is responsible for a specific operation, making the code modular and easy to maintain.

