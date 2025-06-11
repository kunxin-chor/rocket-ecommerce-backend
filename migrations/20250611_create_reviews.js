exports.up = function(knex) {
  return knex.schema.createTable('reviews', function(table) {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('rating').notNullable();
    table.text('comment');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['product_id', 'user_id']); // One review per user per product
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('reviews');
};
