  
const app = require('../src/app');
const knex = require('knex');
const jwt = require('jsonwebtoken');
const helpers = require('./test-helpers');

describe( 'Auth Endpoints', () => {
    let db;
    const { testUsers } = helpers.makeFixtures();
    const testUser = testUsers[0];

    before('make db connection', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        });
        app.set('db', db);
    });

    after(`disconnect from database`, () => { db.destroy() });
    
    before(`truncate database and restart identities`, () => { helpers.cleanTables(db) });

    afterEach(`truncate database and restart identities`, () => { console.log('running'); helpers.cleanTables(db) });

    describe('POST /api/auth/login', () => {

        beforeEach('insert users', () => {
            return (
                helpers.seedTables(
                    db,
                    testUsers,
                    [],
                    [],
                )
            );
        });

        const requiredFields = ['user_name', 'password'];

        requiredFields.forEach(field => {
            const loginAttemptBody = {
              user_name: testUser.user_name,
              password: testUser.password
            };

            it(`responds 400 + 'required' error when ${field} is missing`, () => {
                delete loginAttemptBody[field];
                return (
                    supertest(app)
                        .post('/api/auth/login')
                        .send(loginAttemptBody)
                        .expect(
                            400,
                            { error: `Missing '${field}' in request body` }
                        )
                );
            });
        });

        it(`responds 400 'Password must be longer than 8 characters' when empty password`, () => {
            const userShortPassword = {
              user_name: 'test user_name',
              password: '1234567'
            }
            return supertest(app)
              .post('/api/users')
              .send(userShortPassword)
              .expect(400, { error: `Password must be longer than 8 characters` })
        })

        it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
            const userLongPassword = {
                id: 20,
              user_name: 'test user_name',
              password: '*'.repeat(73)
            }
            // console.log(userLongPassword)
            // console.log(userLongPassword.password.length)
            return supertest(app)
              .post('/api/users')
              .send(userLongPassword)
              .expect(400, {
                error: 'Password must be less than 72 characters'
              })
        })

        it(`responds 400 error when password START with spaces`, () => {
            const userPasswordStartsSpaces = {
              user_name: 'test user_name',
              password: ' 1Aa!2Bb@'
            }
            return supertest(app)
                .post(`/api/auth/login`)
                .send(userPasswordStartsSpaces)
                .expect(400, { error: 'Incorrect username or password' })
        })

        it(`responds 400 error when password ENDS with spaces`, () => {
            const userPasswordStartsSpaces = {
              user_name: 'test user_name',
              password: '1Aa!2Bb@ '
            }
            return supertest(app)
                .post(`/api/auth/login`)
                .send(userPasswordStartsSpaces)
                .expect(400, { error: 'Incorrect username or password' })
        })

        it(`responds 400 error when password isn't complex enough`, () => {
            const userPasswordNotComplex = {
              user_name: 'test user_name',
              password: '11AAaabb'
            }
            return supertest(app)
                .post(`/api/auth/login`)
                .send(userPasswordNotComplex)
                .expect(400, { error: 'Incorrect username or password' })
        })

        it(`responds 400, 'invalid username or password' when incorrect login`, () => {
            const invalidUserLogin = { user_name: 'user-not', password: 'wrong' };
            return (
                supertest(app)
                    .post(`/api/auth/login`)
                    .send(invalidUserLogin)
                    .expect(
                        400,
                        { error: `Incorrect username or password` }
                    )
            );
        });

        it(`responds 400, 'invalid username or password' when incorrect login`, () => {
            const invalidUserPass = { user_name: testUser.user_name, password: 'wrong' };
            return (
                supertest(app)
                    .post(`/api/auth/login`)
                    .send(invalidUserPass)
                    .expect(
                        400,
                        { error: `Incorrect username or password` }
                    )
            );
        });

        it(`responds 200 and JWT auth token using secret when valid credentials`, () => {
            const validUserCreds = {
                user_name: testUser.user_name,
                password: testUser.password
            };
            const expectedToken = jwt.sign(
                { user_id: testUser.id }, // payload
                process.env.JWT_SECRET,

                {
                    subject: testUser.user_name,
                    expiresIn: process.env.JWT_EXPIRY,
                    algorithm: 'HS256'
                }
            );
            return (
                supertest(app)
                    .post(`/api/auth/login`)
                    .send(validUserCreds)
                    .expect(
                        200,
                        { authToken: expectedToken }
                    )
            );
        });

    });
});