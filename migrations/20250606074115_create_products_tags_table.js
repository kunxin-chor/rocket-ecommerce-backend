/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("products_tags", (table) => {
    table.increments("id").primary();
    table.integer("product_id").unsigned().notNullable().references("products.id").onDelete("CASCADE");
    table.integer("tag_id").unsigned().notNullable().references("tags.id").onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable("products_tags");
};
