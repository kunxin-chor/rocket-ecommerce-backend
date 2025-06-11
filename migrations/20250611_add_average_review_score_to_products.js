exports.up = function(knex) {
  return knex.schema.table('products', function(table) {
    table.float('average_review_score').defaultTo(0);
  });
};

exports.down = function(knex) {
  return knex.schema.table('products', function(table) {
    table.dropColumn('average_review_score');
  });
};
