require('dotenv').config();

// main express root
const express = require('express');
const app = express();

// configuration
const { NODE_ENV } = require('./config');
const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

// middleware
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

// routers
const personRouter = require('./person/person-router');
const rmbrRouter = require('./rmbr/rmbr-router');
const authRouter = require('./auth/auth-router');
const userRouter = require('./user/user-router');

// initialize middleware
app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());

// basic root to confirm server is running
app.get('/', (req, res) => {
  res.send(`Server's buns are buttered`)
});

// routes
app.use('/api/person', personRouter);
app.use('/api/rmbr', rmbrRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// error handler settings
app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { message: 'server error' }  // alt -> response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { 
      message: error.message, error 
    }
  }
  res
    .status(500)
    .json(response)
});

module.exports = app;