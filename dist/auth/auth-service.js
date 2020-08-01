// authentication service
var config = require('../config');
// utils
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var AuthService = {
    getUserWithUsername: function (db, user_name) {
        return (db('rmbrme_users')
            .where({ user_name: user_name })
            .first());
    },
    comparePasswords: function (password, hash) {
        return (bcrypt
            .compare(password, hash));
    },
    createJwt: function (subject, payload) {
        return (jwt
            .sign(payload, config.JWT_SECRET, {
            subject: subject,
            expiresIn: config.JWT_EXPIRY,
            algorithm: 'HS256'
        }));
    },
    verifyJwt: function (token) {
        return (jwt
            .verify(token, config.JWT_SECRET, {
            algorithms: ['HS256']
        }));
    },
    parseBasicToken: function (token) {
        return Buffer
            .from(token, 'base64')
            .toSpring()
            .split(':');
    }
};
module.exports = AuthService;
