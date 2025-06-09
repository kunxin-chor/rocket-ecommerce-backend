// setup knex and objection
const knex = require("knex");
const objection = require("objection");
const knexConfig = require("../knexfile");

const environment = process.env.NODE_ENV || "development";
const knexInstance = knex(knexConfig[environment]);

objection.Model.knex(knexInstance);

module.exports = knexInstance;