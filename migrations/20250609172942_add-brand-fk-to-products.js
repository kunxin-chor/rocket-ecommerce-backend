/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable("products", (table) => {
    table.integer("brand_id").unsigned().notNullable().defaultTo(1);
    table.foreign("brand_id").references("brands.id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable("products", (table) => {
    table.dropForeign("brand_id");
    table.dropColumn("brand_id"); 
  });
};
