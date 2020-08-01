// authentication router
var express = require('express');
var requireAuth = require('../middleware/jwt-auth').requireAuth;
var jsonBodyParser = express.json();
var authRouter = express.Router();
// service
var AuthService = require('./auth-service');
authRouter
    .post('/login', jsonBodyParser, function (req, res, next) {
    var _a = req.body, user_name = _a.user_name, password = _a.password;
    var loginUser = { user_name: user_name, password: password };
    // verify user_name and email are in the request body
    for (var _i = 0, _b = Object.entries(loginUser); _i < _b.length; _i++) {
        var _c = _b[_i], key = _c[0], value = _c[1];
        // if one is missing, return error and key missing
        if (value == null)
            return res
                .status(400)
                .json({
                error: "Missing '" + key + "' in request body"
            });
    }
    AuthService.getUserWithUsername(req.app.get('db'), loginUser.user_name)
        .then(function (dbUser) {
        // if the user doesn't exist, return error
        if (!dbUser)
            return res
                .status(400)
                .json({
                error: 'Incorrect username or password'
            });
        return AuthService.comparePasswords(loginUser.password, dbUser.password)
            .then(function (compareMatch) {
            // if request body password and db password don't match, return error
            if (!compareMatch)
                return res
                    .status(400)
                    .json({
                    error: 'Incorrect username or password',
                });
            // try creating jwt and returning it to user
            try {
                var sub = dbUser.user_name;
                var payload = { user_id: dbUser.id };
                var user_id = dbUser.id;
                res.send({
                    authToken: AuthService.createJwt(sub, payload),
                    user_id: user_id
                });
            }
            catch (err) {
                return res
                    .send(500)
                    .json({
                    error: "Couldn't create token"
                });
            }
        });
    })
        // handle an error not already handled
        .catch(function () {
        res
            .send(500)
            .json({
            error: "Couldn't create token"
        });
        next();
    });
});
// refresh client token
authRouter
    .post('/refresh', requireAuth, function (req, res) {
    var sub = req.user.user_name;
    var payload = { user_id: req.user.id };
    var user_id = payload.user_id;
    res.send({
        authToken: AuthService.createJwt(sub, payload),
        user_id: user_id
    });
});
module.exports = authRouter;
