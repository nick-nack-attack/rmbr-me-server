"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
;
const config = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY,
    API_TOKEN: process.env.API_TOKEN,
    ADMIN_PERMISSION: process.env.ADMIN_PERMISSION
};
exports.default = config;
//# sourceMappingURL=config.js.map