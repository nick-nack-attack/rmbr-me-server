// service for user router
import bcrypt from 'bcryptjs';
import xss from 'xss';
import {database, User} from "types";
// variable for special characters
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UserService = {
  hasUserWithUserName: async (db: database, user_name: string) => {
    return db('rmbrme_users')
      .where({ user_name })
      .first()
      .then(user => !!user)
  },
  insertUser: async (db: database, newUser: { password: string; user_name: any; date_created: string }) => {
    return db
      .insert(newUser)
      .into('rmbrme_users')
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
    if (password.startsWith(' ') || password.endsWith(' ') ) {
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
  serializeUser: (user: User) => {
    const {user_name} = user;
    return {
      id: user.id,
      user_name: xss(user_name),
      date_created: new Date(user.date_created)
    }
  },
};

export default UserService;