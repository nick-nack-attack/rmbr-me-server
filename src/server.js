// Server entry point
const app = require('./app');

// Configuration
require('dotenv').config();
const { PORT, DB_URL } = require('./config');

// Utilities
const knex = require('knex');

// Database
const db = knex({
  client: 'pg',
  connection: DB_URL
})

// Global variables
 app.set('db', db)

 app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

 // module.exports = { app };