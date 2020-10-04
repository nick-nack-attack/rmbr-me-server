import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({path: path.join(__dirname, '../.env')});

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;
const DATABASE_URL = process.env.DATABASE_URL;
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = +process.env.JWT_EXPIRY;
const API_TOKEN = process.env.API_TOKEN;
const ADMIN_PERMISSION = process.env.ADMIN_PERMISSION;

export {
  PORT,
  NODE_ENV,
  DATABASE_URL,
  TEST_DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRY,
  API_TOKEN,
  ADMIN_PERMISSION,
};
