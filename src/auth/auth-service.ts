// authentication service
import {db} from '../database/connect';
import {JWT_EXPIRY, JWT_SECRET} from '../config';

// utils
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const AuthService = {
  getUserWithUsername: (user_name: any) => {
    return db
      .from('rmbrme_users')
      .where({user_name})
      .first()
  },

  comparePasswords: (password, hash) => {
    return bcrypt.compare(password, hash)
  },

  createJwt: (subject, payload) => {
    try {
      return jwt.sign(
        payload,
        JWT_SECRET,
        {
          subject,
          expiresIn: JWT_EXPIRY,
          algorithm: 'HS256'
        }
      );
    } catch (err) {
      return err;
    }
  },

  verifyJwt: (token) => {
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
