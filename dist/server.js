// server entry point
var app = require('./app');
// configuration
require('dotenv').config();
var _a = require('./config'), PORT = _a.PORT, DATABASE_URL = _a.DATABASE_URL;
// utilities
var knex = require('knex');
// database
var db = knex({
    client: 'pg',
    connection: DATABASE_URL
});
// Global variables
app.set('db', db);
// Oven is hot means it's listening
app.listen(PORT, function () { return console.log("The oven is hot on " + PORT); });
