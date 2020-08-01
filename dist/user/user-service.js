// service for user router
var bcrypt = require('bcryptjs');
var xss = require('xss');
// variable for special characters
var REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;
var UserService = {
    hasUserWithUserName: function (db, user_name) {
        return db('rmbrme_users')
            .where({ user_name: user_name })
            .first()
            .then(function (user) { return !!user; });
    },
    insertUser: function (db, newUser) {
        return db
            .insert(newUser)
            .into('rmbrme_users')
            .returning('*')
            .then(function (_a) {
            var user = _a[0];
            return user;
        });
    },
    validatePassword: function (password) {
        if (password.length < 8) {
            return 'Password must be longer than 8 characters';
        }
        if (password.length > 72) {
            return 'Password must be less than 72 characters';
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces';
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return 'Password must contain 1 upper case, lower case, number and special character';
        }
        return null;
    },
    hashPassword: function (password) {
        return bcrypt.hash(password, 12);
    },
    serializeUser: function (user) {
        return {
            id: user.id,
            user_name: xss(user.user_name),
            date_created: new Date(user.date_created)
        };
    },
};
module.exports = UserService;
