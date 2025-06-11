const { Model } = require("objection");

class CartItem extends Model {
    static get tableName() {
        return "cart_items";
    }

    static relationMappings = {
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./User"),
            join: {
                from: "cart_items.user_id",
                to: "users.id"
            }
        },
        product: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Product"),
            join: {
                from: "cart_items.product_id",
                to: "products.id"
            }
        }
    }
}

module.exports = CartItem;
