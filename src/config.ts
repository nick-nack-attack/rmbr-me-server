import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({path: path.join(__dirname, '../.env')});

export const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV;
export const DATABASE_URL = process.env.DATABASE_URL;
export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRY = +process.env.JWT_EXPIRY;
export const API_TOKEN = process.env.API_TOKEN;
export const ADMIN_PERMISSION = process.env.ADMIN_PERMISSION;
