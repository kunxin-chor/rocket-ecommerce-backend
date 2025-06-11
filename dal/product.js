const Product = require("../models/Product");
const Category = require("../models/Category");
const Tag = require("../models/Tag");

const getAllProducts = async () => {
    return await Product.query().withGraphFetched("[category, tags]");
}

const getProductById = async (id) => {
    return await Product.query().findById(id).withGraphFetched("[category, tags]");
}

const createProduct = async (product, transaction = null) => {
    if (transaction) {
        return await Product.query(transaction).insert(product);
    }
    return await Product.query().insert(product);
}

const updateProduct = async (id, product, transaction = null) => {
    if (transaction) {
        return await Product.query(transaction).update(product).where("id", id);
    }
    return await Product.query().update(product).where("id", id);
}

const deleteProduct = async (id) => {
    return await Product.query().deleteById(id);
}

const getAllCategories = async () => {
    return await Category.query().select("id", "name");
}

const getAllTags = async () => {
    return await Tag.query().select("id", "name");
}

const search =  async (searchTerms) => {
    const query = Product.query().withGraphFetched("[category, tags]");
    
    if (searchTerms.name) {
        query.whereILike("name", `%${searchTerms.name}%`);
    }
    if (searchTerms.min_cost) {
        query.where("cost", ">=", searchTerms.min_cost);
    }
    if (searchTerms.max_cost) {
        query.where("cost", "<=", searchTerms.max_cost);
    }
    if (searchTerms.category_id) {
        query.where("category_id", searchTerms.category_id);
    }
    if (searchTerms.tags) {
        const tagIds = searchTerms.tags.split(",").map(id => parseInt(id));
        query
            .join('products_tags', 'products.id', 'products_tags.product_id')
            .whereIn('products_tags.tag_id', tagIds)
            .groupBy('products.id')
            .havingRaw('COUNT(DISTINCT products_tags.tag_id) = ?', [tagIds.length]);
    }
    return await query;
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllCategories,
    getAllTags,
    search
}