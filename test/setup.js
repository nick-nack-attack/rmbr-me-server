process.env.TZ = 'UTC';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRY = '3m';

import dotenv from 'dotenv';
dotenv.config();

process.env.TEST_DB_URL = process.env.TEST_DB_URL || "postgresql://postgres@localhost/rmbrme-test";

import { expect }  from 'chai';
import supertest  from 'supertest';

global.expect = expect;
global.supertest = supertest;
