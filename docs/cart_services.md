## What is the service layer?

A service encapsulates complex logic which we may want to reuse. The difference between a data access layer and a service is that the latter usually encompasses business rules/logic while the former is usually simple access to the tables.

For example, where do we implement the following functionality?

Discount (per item and for the entire shopping cart)
Promotions
Limiting the quantity of certain coveted products (such as customized shoes or limited t-shirts)

Programming is concerned with how to implement features whereas software engineering is concerned with where to place those code.

Here are a few places to implement the above features

Controller (aka routes): Those logic can definitely go into the controller, but right now our controllers are for a web application. What if we want to support an API later?

Objection Model: A CartItem model represents only one item in a shopping cart. We cannot place code that requires the entire shopping cart.

Data Access: While it can arguably be placed there (meaning, it's up for debate), we don't usually place business logic there.

Hence the ideal will be in a service. 

In this case, our cart will have the following functionalities:

Add item to cart
Remove item from cart
Create Stripe payment
Empty cart

A service layer will in turn rely on a data layer to get those tasks done. The diagram below shows an overview of the methods inside the service layer and the data layer it will use.


### Creating the Cart Services
After creating the cart data layer, let's move on to the cart services. Create a new folder named services in the project folder (the folder with the package.json file) and create a new file named `cartItemService.js`.

In the `cartItemService.js` file, we will begin by requiring all the functions from the `dal/cart_items.js` in an object named `cartItemDal`. This is more convenient than requiring each function from the layer one by one.

```javascript
const cartItemDal = require('../dal/cart_items');
```

### Implementing the Cart Service Methods

The service layer should provide methods that encapsulate business logic and orchestrate calls to the data layer. Below are the main functionalities you will need for a typical shopping cart service.

#### Adding an Item to the Cart

When a user adds a product to their cart, we want to increment the quantity if the product already exists, or add a new item if it doesn't. This logic belongs in the service layer.

```javascript
const addItemToCart = async (userId, productId) => {
    // Check if the item already exists in the user's cart
    const item = await cartItemDal.getCartItemByUserAndProduct(userId, productId);
    if (item) {
        // Increment the quantity if it exists
        return await cartItemDal.updateCartItem(item.id, { quantity: item.quantity + 1 });
    } else {
        // Otherwise, create a new cart item
        return await cartItemDal.createCartItem({ user_id: userId, product_id: productId, quantity: 1 });
    }
};
```

This function first checks if the cart item exists for the user and product.
- If it exists, it increments the quantity.
- If not, it creates a new cart item with quantity 1.

#### Getting All Cart Items for a User

To display the user's cart, we need a function to get all items (with product details).

```javascript
const getCartItemsByUserId = async (userId) => {
    return await cartItemDal.getCartItemsByUserId(userId);
};
```

This function delegates to the DAL and returns all cart items for the user. This is common in the service layer as it allows us to change the DAL implementation without affecting the service layer.

#### Updating the Quantity of a Cart Item

To change the quantity of a product in the cart, we use the following function.

```javascript
const updateCartItemQuantity = async (userId, productId, quantity) => {
    const item = await cartItemDal.getCartItemByUserAndProduct(userId, productId);
    if (!item) throw new Error('Cart item not found');
    return await cartItemDal.updateCartItem(item.id, { quantity });
};
```

This function finds the cart item for the user and product. If not found, it throws an error.  Otherwise, it updates the quantity.

#### Removing an Item from the Cart

To remove a product from the user's cart, you can use the following function.

```javascript
const removeCartItem = async (userId, productId) => {
    const item = await cartItemDal.getCartItemByUserAndProduct(userId, productId);
    if (!item) throw new Error('Cart item not found');
    return await cartItemDal.deleteCartItem(item.id);
};
```

This function checks if the item exists before attempting to delete it. It will throw an error if the item does not exist.

#### Clearing the Cart

To remove all items from a user's cart, use the following function.

```javascript
const clearCart = async (userId) => {
    return await cartItemDal.clearCart(userId);
};
```

#### Get the cart total along with the cart items

```javascript
const getCartWithTotal = async (userId) => {
    const items = await getCartItemsByUserId(userId);
    let totalCost = 0;
    for (const item of items) {
        totalCost += (item.product.cost || 0) * item.quantity;
    }
    return { items, totalCost };
};
```

This function is useful for rendering the cart page. In this function, the code loops through all cart items, summing up the quantities and costs. Here are a few reasons why we don't do this in the database using Objection or MySQL:

* There may be other business logic, like discounts, sales or promotions affecting the total cost.
* There may be other sources of data that we need to include in the summary, such as tax rates or shipping costs.
* It's more flexible to calculate the summary in the service layer, as we can easily modify the logic without changing the DAL.

#### Exporting the Service Methods

At the end of the file, export all the service functions so they can be used in your routes or controllers.

```javascript
module.exports = {
    addItemToCart,
    getCartItemsByUserId,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    getCartWithTotal
};
```

With these methods, your service layer encapsulates all business logic for managing the shopping cart, making your application easier to maintain and extend.
