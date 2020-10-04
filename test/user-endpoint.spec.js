const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = require('../src/server.ts');
const helpers = require('./test-helpers');

describe('user endpoint', function() {

    let db
    const { testUserArray } = helpers.makeFixtures()
    const testUser = testUserArray[0]

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    });
    after('disconnect from db', () => db.destroy());
    beforeEach('cleanup', () => helpers.cleanTables(db));
    afterEach('cleanup', () => helpers.cleanTables(db));

    describe(`POST /api/user`, () => {

        context('user validation', () => {

            beforeEach('insert user', () => {
                return (
                    helpers.seedTables(
                        db,
                        testUserArray,
                        [],
                        [],
                    )
                );
            });

            const requiredFields = [ 'user_name', 'password' ]

            requiredFields.forEach(field => {
                const registerAttemptBody = {
                    // id: 10,
                    user_name: 'test user_name',
                    password: 'test password',
                }

                it(`responds with 400 required error when '${field}' is missing`, () => {

                    delete registerAttemptBody[field]
    
                    return supertest(app)
                        .post('/api/user')
                        .send(registerAttemptBody)
                        .expect(400, { error: `Missing '${field}' in request body`})
                        
    
                })

                it(`responds 400 'Password must be longer than 8 characters' when empty password`, () => {
                    const userShortPassword = {
                      user_name: 'test user_name',
                      password: '1234567'
                    }
                    return supertest(app)
                      .post('/api/user')
                      .send(userShortPassword)
                      .expect(400, { error: `Password must be longer than 8 characters` })
                })

                it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
                    const userLongPassword = {
                      user_name: 'test user_name',
                      password: '*'.repeat(73)
                    }
                    return supertest(app)
                      .post('/api/user')
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
                      .post('/api/user')
                      .send(userPasswordStartsSpaces)
                      .expect(400, { error: 'Password must not start or end with empty spaces' })
                })

                it(`responds 400 error when password ENDS with spaces`, () => {
                    const userPasswordStartsSpaces = {
                      user_name: 'test user_name',
                      password: '1Aa!2Bb@ '
                    }
                    return supertest(app)
                      .post('/api/user')
                      .send(userPasswordStartsSpaces)
                      .expect(400, { error: 'Password must not start or end with empty spaces' })
                })

                it(`responds 400 error when password isn't complex enough`, () => {
                    const userPasswordNotComplex = {
                      user_name: 'test user_name',
                      password: '11AAaabb'
                    }
                    return supertest(app)
                      .post('/api/user')
                      .send(userPasswordNotComplex)
                      .expect(400, { error: 'Password must contain 1 upper case, lower case, number and special character' })
                })

                it(`responds 400 'User name already taken' when user_name isn't unique`, () => {
                    const duplicateUser = {
                      user_name: testUser.user_name,
                      password: '11AAaa!!'
                    }
                    return supertest(app)
                      .post('/api/user')
                      .send(duplicateUser)
                      .expect(400, { error: 'Username already taken' })
                })

                context(`happy path`, () => {

                    it(`responds 201, serialized user, storing bcryped password`, () => {
                        const newUser = {
                          user_name: 'test@gmail.com',
                          password: '11AAaa!!'
                        }
                        return supertest(app)
                          .post('/api/user')
                          .send(newUser)
                          .expect(201)
                          .expect(res => {
                            expect(res.body).to.have.property('id')
                            expect(res.body.user_name).to.eql(newUser.user_name)
                            expect(res.body).to.not.have.property('password')
                            expect(res.headers.location).to.eql(`/api/user/${res.body.id}`)
                            const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' });
                            const actualDate = new Date(res.body.date_created).toLocaleString('en', { timeZone: 'UTC' });
                            expect(actualDate).to.eql(expectedDate);
                          })
                          .expect(res =>
                            db
                              .from('rmbrme_users')
                              .select('*')
                              .where({ id: res.body.id })
                              .first()
                              .then(row => {
                                expect(row.user_name).to.eql(newUser.user_name)
                                const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                                const actualDate = new Date(res.body.date_created).toLocaleString('en', { timeZone: 'UTC' });
                                expect(actualDate).to.eql(expectedDate)
                                return bcrypt.compare(newUser.password, row.password)
                              })
                              .then(compareMatch => {
                                expect(compareMatch).to.be.true
                              })
                          )
                      })

                })

            })

        })

    })

})