// service for user router
import * as bcrypt from 'bcryptjs';
import * as xss from 'xss';
import { db } from "../database/connect";

// variable for special characters
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

export interface IUser {
  id: number;
  role: number;
  user_name: string;
  password: string;
  date_created: string;
  date_modified: string;
  google_sub: string;
}

interface IUserBase {
  user_name: string;
}

export interface IUserWithPassword extends IUserBase{
  password: string;
}

export interface IUserWithGoogle extends  IUserBase {
  google_sub: string;
}

const UserService = {
  hasUserWithUserName: async (user_name: string) => {
    return db('users')
      .where({ user_name })
      .first()
      .then(user => !!user)
  },

  insertUser: async (newUser: IUserWithPassword | IUserWithGoogle): Promise<IUser> => {
    return db
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(([user]) => user)
  },

  validatePassword: (password: string) => {
    if (password.length < 8) {
      return 'Password must be longer than 8 characters'
    }
    if (password.length > 72) {
      return 'Password must be less than 72 characters'
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces'
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain 1 upper case, lower case, number and special character'
    }
    return null
  },
  hashPassword: (password: string) => {
    return bcrypt.hash(password, 12)
  },
  serializeUser: (user) => {
    const {user_name} = user;
    return {
      id: user.id,
      user_name: xss.filterXSS(user_name),
      date_created: new Date(user.date_created)
    }
  },
};

export default UserService;
