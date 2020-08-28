// authentication service


const config = require('../config');
import Knex from 'knex';

// utils
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AuthService = {

  getUserWithUsername: (db: Knex, user_name: any) => {
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