import app from '../src/server.ts';
import knex from 'knex';
import helpers from './test-helpers';

describe(`rmbr endpoint`, () => {
    let db;
    // create db schema as JS objects
    const {
        testUserArray,
        testPersonArray,
        testRmbrArray
    } = helpers.makeFixtures();

    before('connect to db', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        });
        app.set('db', db);
    });

    after(`disconnect from db`, () => { return db.destroy() });
    beforeEach(`truncate database and restart identities`, () => { return helpers.cleanTables(db) });
    afterEach(`truncate database and restart identities`, () => { return helpers.cleanTables(db) });

    describe(`GET /api/rmbr`, () => {

        context(`empty rmbr table`, () => {

            beforeEach('seed db', () => {
                return (
                  helpers.seedTables(
                    db,
                    testUserArray,
                    testPersonArray,
                    []
                  )
                );
            });

            it(`responds with 200 and empty array`, () => {
                return (
                    supertest(app)
                        .get(`/api/rmbr`)
                        .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
                        .expect(200, [])
                );
            });

        })

        context(`given there is one rmbr (or more)`, () => {

            beforeEach('seed db', () => {
                return (
                  helpers.seedTables(
                    db,
                    testUserArray,
                    testPersonArray,
                    testRmbrArray
                  )
                );
            });

            it(`responds with 200 and a rmbr array`, () => {
                const expectedRmbrArray =
                    testRmbrArray
                        // .filter(rbr => rbr.user_id === testUserArray[0].id)
                        .map(tsk => {
                            return (
                                helpers.makeExpectedRmbr(tsk)
                            );
                        });

                return (
                    supertest(app)
                        .get(`/api/rmbr`)
                        .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
                        .expect(200, expectedRmbrArray)
                );
            });

        });

    });

    describe(`GET /api/rmbr/:rmbr_id`, () => {

        context(`empty rmbr table in database`, () => {

            beforeEach('seed db', () => {
                return (
                  helpers.seedTables(
                    db,
                    testUserArray,
                    testPersonArray,
                    []
                  )
                );
            });

            it(`responds with 404`, () => {
                return (
                    supertest(app)
                        .get(`/api/rmbr/1000`)
                        .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
                        .expect(404, {
                            error: `Rmbr doesn't exist`
                        })
                );
            });

        });

        context(`given there is one rmbr (or more)`, () => {

            beforeEach('seed db', () => {
                return (
                  helpers.seedTables(
                    db,
                    testUserArray,
                    testPersonArray,
                    testRmbrArray
                  )
                );
            });

            it(`responds 200 and specified rmbr`, () => {
                const rmbr_id = 1;
                const expectedRmbr = helpers.makeExpectedRmbr(testRmbrArray[rmbr_id - 1]);
                return (
                    supertest(app)
                        .get(`/api/rmbr/${rmbr_id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
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
                    testUserArray,
                    testPersonArray,
                    [] //testRmbrs
                  )
                );
            });

            it(`responds 201 and new rmbr`, function() {
                this.retries(3);
                const testUser = testUserArray[0];
                const newRmbr = {
                    rmbr_title: 'rmbr title',
                    person_id: 1,
                    user_id: 1
                };
                return (
                    supertest(app)
                        .post(`/api/rmbr`)
                        .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
                        .send(newRmbr)
                        .expect(201)
                        .expect(res => {
                            expect(res.body).to.have.property('id');
                            expect(res.body.title).to.eql(newRmbr.title);
                            expect(res.body.user_id).to.eql(testUser.id)
                            expect(res.headers.location).to.eql(`/api/rmbr/${res.body.id}`);
                            const expectedCreatedDate = new Date().toLocaleString();
                            const actualCreatedDate = new Date(res.body.date_created).toLocaleString();
                            expect(expectedCreatedDate.hours).to.eql(actualCreatedDate.hours)
                            expect(expectedCreatedDate.day).to.eql(actualCreatedDate.day)

                        })
                );
            });

        });

    });

    describe(`DELETE /api/rmbr/:rmbr_id`, () => {

        context(`given rmbr does NOT exist`, () => {

            beforeEach('seed db', () => {
                return (
                  helpers.seedTables(
                    db,
                    testUserArray,
                    testPersonArray,
                    [] //testRmbrs
                  )
                );
            });

            it(`responds 404`, () => {
                const rmbr_id = 1000;
                return (
                    supertest(app)
                        .delete(`/api/rmbr/${rmbr_id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
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
                    testUserArray,
                    testPersonArray,
                    testRmbrArray
                  )
                );
            });

            it(`responds 204 and rmbr is deleted`, () => {
                const rmbr_id = 1;
                return (
                    supertest(app)
                        .delete(`/api/rmbr/${rmbr_id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
                        .expect(204)
                        .then(() => {
                            // verify that 404 is received
                            return (
                                supertest(app)
                                    .get(`/api/rmbr/${rmbr_id}`)
                                    .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
                                    .expect(404)
                            );
                        })
                );
            });

        })

    })

    describe(`PATCH /api/rmbr/:rmbr_id`, () => {

        context(`given rmbrs DO NOT exist`, () => {

            beforeEach('seed db', () => {
                return (
                  helpers.seedTables(
                    db,
                    testUserArray,
                    testPersonArray,
                    []
                  )
                );
            });

            it(`responds 404`, () => {
                const rmbr_id = 1000;
                const updatedRmbr = {
                    rmbr_title: 'NEW RMBR TITLE'
                };
                return (
                    supertest(app)
                        .patch(`/api/rmbr/${rmbr_id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
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
                    testUserArray,
                    testPersonArray,
                    testRmbrArray
                  )
                );
            });

            it(`responds 201 and rmbr is updated`, function() {
                this.retries(3);
                const rmbr_id = 1;
                const updatedRmbr = {
                    rmbr_title: 'NEW RMBR TITLE!!',
                    rmbr_text: 'new text',
                    person_id: 1,
                    user_id: 1
                };
                const expectedRmbr = {
                    ...testRmbrArray[rmbr_id - 1],
                    ...updatedRmbr,
                    date_modified: new Date().toLocaleString(),
                    date_created: new Date(testRmbrArray[rmbr_id - 1].date_created).toLocaleString()
                };

                return (
                    supertest(app)
                        .patch(`/api/rmbr/${rmbr_id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
                        .send(updatedRmbr)
                        .expect(200)
                        .then(res => {
                            return (
                                supertest(app)
                                    .get(`/api/rmbr/${rmbr_id}`)
                                    .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
                                    .send(updatedRmbr)
                                    .expect(200)
                                    .then(res => {
                                        return (
                                            supertest(app)
                                            .get(`/api/rmbr/${rmbr_id}`)
                                            .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
                                            .expect(200)
                                                .expect(res => {
                                                    const actualDateCreated = new Date(res.body.date_created).toLocaleString();
                                                    const actualDateModified = new Date(res.body.date_modified).toLocaleString();
                                                    expect(expectedRmbr.date_created.hours).eql(actualDateCreated.hours)
                                                    expect(expectedRmbr.date_created.day).eql(actualDateCreated.day)
                                                    expect(expectedRmbr.date_modified.hours).eql(actualDateModified.hours)
                                                    expect(expectedRmbr.date_modified.day).eql(actualDateModified.day)
                                                })
                                        )
                                    })
                            )
                        })

                )

            })

        })

    })

})
