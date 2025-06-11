/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("cart_items", (table) => {
    table.increments("id").primary();
    table.integer("product_id").unsigned().notNullable();
    table.integer("quantity").unsigned().notNullable();
    table.integer("user_id").unsigned().notNullable();
    table.foreign("product_id").references("products.id").onDelete("CASCADE");
    table.foreign("user_id").references("users.id").onDelete("CASCADE");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable("cart_items");
};
