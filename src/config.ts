require('dotenv').config();

interface Config {
    PORT: number | string;
    NODE_ENV: string;
    DATABASE_URL: string;
    TEST_DATABASE_URL: string,
    JWT_SECRET: string,
    JWT_EXPIRY: number | string,
    API_TOKEN: string,
    ADMIN_PERMISSION: number | string
};

const config: Config = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY,
    API_TOKEN: process.env.API_TOKEN,
    ADMIN_PERMISSION: process.env.ADMIN_PERMISSION
};

export default config;
