/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('categories').del()
  await knex('categories').insert([
    {id: 1, name: 'Meat Replacement'},
    {id: 2, name: 'Dairy Alternatives'},
    {id: 3, name: 'Plant-Based Snacks'}
  ]);
};
