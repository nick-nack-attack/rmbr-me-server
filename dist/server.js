"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
app_1.default.listen(config_1.default.PORT, () => {
    console.log(`Server listening at http://localhost:${config_1.default.PORT}`);
});
/*
// server entry point
const app = require('./app');
// configuration
require('dotenv').config();
const {
  PORT,
  DATABASE_URL
} = require('./config')
// utilities
const knex = require('knex');
// database
const db = knex({
  client: 'pg',
  connection: DATABASE_URL
});
// Global variables
 app.set('db', db);
// Oven is hot means it's listening
 app.listen(PORT, () => console.log(`The oven is hot on ${PORT}`));
 */
//# sourceMappingURL=server.js.map