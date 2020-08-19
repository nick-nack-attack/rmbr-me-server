"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// service for user router
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const xss_1 = __importDefault(require("xss"));
// variable for special characters
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;
const UserService = {
    hasUserWithUserName: (db, user_name) => __awaiter(void 0, void 0, void 0, function* () {
        return db('rmbrme_users')
            .where({ user_name })
            .first()
            .then(user => !!user);
    }),
    insertUser: (db, newUser) => __awaiter(void 0, void 0, void 0, function* () {
        return db
            .insert(newUser)
            .into('rmbrme_users')
            .returning('*')
            .then(([user]) => user);
    }),
    validatePassword: (password) => {
        if (password.length < 8) {
            return 'Password must be longer than 8 characters';
        }
        if (password.length > 72) {
            return 'Password must be less than 72 characters';
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces';
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return 'Password must contain 1 upper case, lower case, number and special character';
        }
        return null;
    },
    hashPassword: (password) => {
        return bcryptjs_1.default.hash(password, 12);
    },
    serializeUser: (user) => {
        const { user_name } = user;
        return {
            id: user.id,
            user_name: xss_1.default(user_name),
            date_created: new Date(user.date_created)
        };
    },
};
exports.default = UserService;
//# sourceMappingURL=user-service.js.map