// use local env file
require('dotenv').config();
// main express root
var express = require('express');
var app = express();
// configuration
var NODE_ENV = require('./config').NODE_ENV;
var morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';
// middleware
var morgan = require('morgan');
var cors = require('cors');
var helmet = require('helmet');
// routers
var personRouter = require('./person/person-router');
var rmbrRouter = require('./rmbr/rmbr-router');
var authRouter = require('./auth/auth-router');
var userRouter = require('./user/user-router');
// initialize middleware
app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());
// basic root to confirm server is running
app.get('/', function (req, res) {
    res.send("Server's buns are buttered");
});
// routes
app.use('/api/person', personRouter);
app.use('/api/rmbr', rmbrRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
// error handler settings
app.use(function errorHandler(error, req, res, next) {
    var response;
    if (NODE_ENV === 'production') {
        response = { message: 'server error' }; // alt -> response = { error: { message: 'server error' } }
    }
    else {
        console.error(error);
        response = {
            message: error.message, error: error
        };
    }
    res
        .status(500)
        .json(response);
});
module.exports = app;
