// authentication service
import {db} from '../database/connect';

const config = require('../config');
import Knex from 'knex';

// utils
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AuthService = {

  getUserWithUsername: (user_name: any) => {
    return db
      .from('rmbrme_users')
      .where({user_name})
      .first()
  },

  comparePasswords: (password, hash) => {
    return (
      bcrypt
        .compare(password, hash)
    )
  },

  createJwt: (subject, payload) => {
    return jwt.sign(
      payload,
      config.JWT_SECRET,
        {
          subject,
          expiresIn: config.JWT_EXPIRY,
          algorithm: 'HS256'
        }
    )
  },

  verifyJwt: (token) => {
    console.log(token, config.JWT_SECRET)
    return jwt.verify(token, config.JWT_SECRET,
      {
        algorithms: ['HS256']
      }
    )
  },

  parseBasicToken: (token) => {
    return Buffer
        .from(token, 'base64')
        .toString()
        .split(':')
  }

};

export default AuthService;