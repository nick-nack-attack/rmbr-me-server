module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_URL: process.env.DB_URL || "postgresql://postgres@localhost/rmbrme",
    TEST_DB_URL: process.env.TEST_DB_URL || "postgresql://postgres@localhost/rmbrme-test",
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "https://rmbrme.now.sh",
    JWT_EXPIRY: process.env.JWT_EXPIRY || 600
}