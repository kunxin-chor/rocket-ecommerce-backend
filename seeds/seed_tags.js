/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('tags').del()
  await knex('tags').insert([
    {id: 1, name: 'Vegan'},
    {id: 2, name: 'Gluten-Free'},
    {id: 3, name: 'Dairy-Free'},
    {id: 4, name: 'Organic'}
  ]);
};
