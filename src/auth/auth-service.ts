// authentication service
import {db} from '../database/connect';
import { JWT_SECRET, JWT_EXPIRY } from '../config';

// utils
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const AuthService = {
  getUserWithUsername: (user_name: any) => {
    return db
      .from('rmbrme_users')
      .where({user_name})
      .first()
  },

  comparePasswords: (password, hash) => bcrypt.compare(password, hash),

  createJwt: (subject, payload) => {
    return jwt.sign(
      payload,
      JWT_SECRET,
        {
          subject,
          expiresIn: JWT_EXPIRY,
          algorithm: 'HS256'
        }
    )
  },

  verifyJwt: (token) => {
    console.log(token, JWT_SECRET)
    return jwt.verify(token, JWT_SECRET,
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
