const { Model } = require("objection");

class Product extends Model {
    static get tableName() {
        return "products";
    }

  static relationMappings = {
    category: {
      relation: Model.BelongsToOneRelation,
      modelClass: require("./Category"),
      join: {
        from: "products.category_id",
        to: "categories.id"
      }
    },
    tags: {
      relation: Model.ManyToManyRelation,
      modelClass: require("./Tag"),
      join: {
        from: "products.id",
        through: {
          from: "products_tags.product_id",
          to: "products_tags.tag_id"
        },
        to: "tags.id"
      }
    }
  }
}

module.exports = Product;
