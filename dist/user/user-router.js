"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// user router
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const date_fns_1 = require("date-fns");
// service
const user_service_1 = __importDefault(require("./user-service"));
const userRouter = express_1.Router();
const jsonBodyParser = express_1.json();
// for posting new users (i.e. sign up)
userRouter
    .route('/')
    .get((req, res, next) => {
})
    .post(jsonBodyParser, (req, res, next) => {
    // set variables
    const userLogin = {
        user_name: req.body.user_name,
        password: req.body.password
    };
    // check for missing values
    for (const [key, value] of Object.entries(userLogin))
        if (value === undefined || value === null)
            return res.status(400).json({
                error: `Missing '${key}' in request body`
            });
    // check to see if password passes validation
    const passwordError = user_service_1.default.validatePassword(userLogin.password);
    if (passwordError)
        return res
            .status(400)
            .json({
            error: passwordError
        });
    // submit login with service
    user_service_1.default.hasUserWithUserName(req.app.get('db'), userLogin.user_name)
        .then((hasUserWithUserName) => {
        // if username is already taken, return error
        if (hasUserWithUserName)
            return res.status(400).json({
                error: `Username already taken`
            });
        return user_service_1.default.hashPassword(userLogin.password)
            .then(hashedPassword => {
            const formattedDate = date_fns_1.format(new Date(), 'M/dd/yyyy, K:mm:s b');
            // create new user object
            const newUser = {
                user_name: userLogin.user_name,
                password: hashedPassword,
                date_created: formattedDate
            };
            // insert new user into db
            return user_service_1.default.insertUser(req.app.get('db'), newUser)
                .then(user => {
                res.status(201)
                    .location(path_1.default.posix.join(req.originalUrl, `/${user.id}`))
                    .json(user_service_1.default.serializeUser(user));
            });
        });
    })
        .catch(next);
});
exports.default = userRouter;
//# sourceMappingURL=user-router.js.map