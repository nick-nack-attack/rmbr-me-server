const app = require('../src/app');
const knex = require('knex');
const helpers = require('./test-helpers');

describe(`Tasks Endpoints`, () => {
    let db;
    // create db schema as JS objects
    const {
        testUsers,
        testPeople,
        testRmbrs
    } = helpers.makeFixtures();

    before('connect to db', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        });
        app.set('db', db);
    });

    after(`disconnect from db`, () => { return db.destroy() });
    before(`truncate database and restart identities`, () => { return helpers.cleanTables(db) });
    afterEach(`truncate database and restart identities`, () => { return helpers.cleanTables(db) });

    describe(`GET /api/tasks`, () => {
        
        context(`given no rmbrs`, () => {

            beforeEach('seed db', () => {
                return (
                  helpers.seedTables(
                    db,
                    testUsers,
                    testPeople,
                    testRmbrs
                  )
                );
            });

            it(`responds 200 with empty array`, () => {
                return (
                    supertest(app)
                        .get(`/api/rmbrs`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(200, [])
                );
            });

        })

        context(`given there ARE rmbrs`, () => {

            beforeEach('seed db', () => {
                return (
                  helpers.seedTables(
                    db,
                    testUsers,
                    testPeople,
                    testRmbrs
                  )
                );
            });

            it(`responds with 200 with an array of people`, () => {
                const expectedRmbrs =
                    testRmbrs
                        .filter(rbr => rbr.user_id === testUsers[0].id)
                        .map(tsk => {
                            return (
                                helpers.makeExpectedPersonRmbr(tsk)
                            );
                        });

                return (
                    supertest(app)
                        .get(`/api/rmbrs`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(200, expectedRmbrs)
                );
            });

        });

    });

    describe(`GET /api/rmbrs/:rmbr_id`, () => {

        context(`given no rmbrs`, () => {

            beforeEach('seed db', () => {
                return (
                  helpers.seedTables(
                    db,
                    testUsers,
                    testPeople,
                    testRmbrs
                  )
                );
            });

            it(`responds with 404`, () => {
                return (
                    supertest(app)
                        .get(`/api/rmbrs/1000`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(404, {
                            error: `Rmbr doesn't exist`
                        })
                );
            });

        });

        context(`given there ARE rmbrs`, () => {

            beforeEach('seed db', () => {
                return (
                  helpers.seedTables(
                    db,
                    testUsers,
                    testPeople,
                    testRmbrs
                  )
                );
            });

            it(`responds 200 and specified rmbr`, () => {
                const rmbrId = 1;
                const expectedRmbr = makeExpectedPersonRmbr(testRmbrs[rmbrId - 1]);
                return (
                    supertest(app)
                        .get(`/api/rmbrs/${rmbrId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(200, expectedRmbr)
                );
            });

        });

    });

    describe(`POST /api/rmbr`, () => {

        context(`given NO rmbrs`, () => {

            beforeEach('seed db', () => {
                return (
                  helpers.seedTables(
                    db,
                    testUsers,
                    testPeople,
                    [] //testRmbrs
                  )
                );
            });

            it(`responds 201 and new rmbr`, function() {
                this.retries(3);
                const testUser = testUsers[0];
                const newRmbr = {
                    rmbr_title: 'rmbr title',
                    person_id: 1,
                    user_id: 1
                };
                return (
                    supertest(app)
                        .post(`/api/rmbrs`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(newRmbr)
                        .expect(201)
                        .expect(res => {
                            expect(res.body).to.have.property('id');
                            expect(res.body.title).to.eql(newRmbr.title);
                            expect(res.body.user_id).to.eql(testUser.id)
                            expect(res.headers.location).to.eql(`/api/rmbrs/${res.body.id}`);
                            const expectedCreatedDate = new Date().toLocaleString();
                            const actualCreatedDate = new Date(res.body.date_created).toLocaleString();
                            expect(expectedCreatedDate).to.eql(actualCreatedDate);
                        })
                );
            });

        });

    });

    describe(`DELETE /api/rmbrs/:rmbr_id`, () => {

        context(`given rmbr does NOT exist`, () => {

            beforeEach('seed db', () => {
                return (
                  helpers.seedTables(
                    db,
                    testUsers,
                    testPeople,
                    [] //testRmbrs
                  )
                );
            });

            it(`responds 404`, () => {
                const rmbrId = 1000;
                return (
                    supertest(app)
                        .delete(`/api/rmbrs/${rmbrId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(404, {
                            error: `Rmbr doesn't exist`
                        })
                )
            });
        });

        context(`given rmbr exists`, () => {

            beforeEach('seed db', () => {
                return (
                  helpers.seedTables(
                    db,
                    testUsers,
                    testPeople,
                    testRmbrs
                  )
                );
            });

            it(`responds 204 and rmbr is deleted`, () => {
                const rmbrId = 1;
                return (
                    supertest(app)
                        .delete(`/api/rmbrs/${rmbrId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(204)
                        .then(() => {
                            // verify that 404 is received
                            return (
                                supertest(app)
                                    .get(`/api/rmbrs/${rmbrId}`)
                                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                                    .expect(404)
                            );
                        })
                );
            });

        })

    })

    describe(`PATCH /api/rmbrs/:rmbr_id`, () => {

        context(`given rmbrs DO NOT exist`, () => {

            beforeEach('seed db', () => {
                return (
                  helpers.seedTables(
                    db,
                    testUsers,
                    testPeople,
                    [] //testRmbrs
                  )
                );
            });

            it(`responds 404`, () => {
                const rmbrId = 1000;
                const updatedRmbr = {
                    rmbr_title: 'NEW RMBR TITLE'
                };
                return (
                    supertest(app)
                        .patch(`/api/rmbrs/${rmbrId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(updatedRmbr)
                        .expect(404, {
                            error: `Rmbr doesn't exist`
                        })
                )
            });

        })

        context(`given rmbrs EXIST`, () => {

            beforeEach('seed db', () => {
                return (
                  helpers.seedTables(
                    db,
                    testUsers,
                    testPeople,
                    testRmbrs
                  )
                );
            });

            it(`responds 201 and rmbr is updated`, function() {
                this.retries(3);
                const rmbrId = 1;
                const updatedRmbr = {
                    rmbr_title: 'NEW RMBR TITLE!!'
                };
                const expectedRmbr = {
                    ...testRmbrs[rmbrId - 1],
                    ...updatedRmbr,
                    date_modified: new Date().toLocaleString(),
                    date_created: new Date(testRmbrs[rmbrId - 1].date_created).toLocaleString()
                };

                return (
                    supertest(app)
                        .patch(`/api/rmbrs/${rmbrId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(200)
                        .expect(res => {
                            const actualDateCreated = new Date(res.body.date_created).toLocaleString();
                            const actualDateModified = new Date(res.body.date_modified).toLocaleString();
                            
                        })
                )

            })

        })

    })

})