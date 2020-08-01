// user router
var _a = require('express'), json = _a.json, Router = _a.Router;
var jsonBodyParser = json();
var userRouter = Router();
var path = require('path');
var format = require('date-fns').format;
// service
var UserService = require('./user-service');
// for posting new users (i.e. sign up)
userRouter
    .post('/', jsonBodyParser, function (req, res, next) {
    // set variables
    var userLogin = {
        user_name: req.body.user_name,
        password: req.body.password
    };
    // check for missing values
    for (var _i = 0, _a = Object.entries(userLogin); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (value === undefined || value === null)
            return res.status(400).json({
                error: "Missing '" + key + "' in request body"
            });
    }
    // check to see if password passes validation
    var passwordError = UserService.validatePassword(userLogin.password);
    if (passwordError)
        return res
            .status(400)
            .json({
            error: passwordError
        });
    // submit login with service
    UserService.hasUserWithUserName(req.app.get('db'), userLogin.user_name)
        .then(function (hasUserWithUserName) {
        // if username is already taken, return error
        if (hasUserWithUserName)
            return res.status(400).json({
                error: "Username already taken"
            });
        return UserService.hashPassword(userLogin.password)
            .then(function (hashedPassword) {
            var formattedDate = format(new Date(), 'M/dd/yyyy, K:mm:s b');
            // create new user object
            var newUser = {
                user_name: userLogin.user_name,
                password: hashedPassword,
                date_created: formattedDate
            };
            // insert new user into db
            return UserService.insertUser(req.app.get('db'), newUser)
                .then(function (user) {
                res.status(201)
                    .location(path.posix.join(req.originalUrl, "/" + user.id))
                    .json(UserService.serializeUser(user));
            });
        });
    })
        .catch(next);
});
module.exports = userRouter;
