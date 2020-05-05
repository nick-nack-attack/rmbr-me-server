const app = require('../src/app');
const knex = require('knex');
const helpers = require('./test-helpers')

describe('Protected endpoints', () => {
    let db;
    // create db schema as JS objects
    const { testUsers, testPeople, testRmbrs } = helpers.makeFixtures();

    before('connect to db', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        });
        app.set('db', db);
    });

    after(`disconnect from database`, () => { db.destroy() });
    before(`truncate database and restart identities`, () => { helpers.cleanTables(db) });
    afterEach(`truncate database and restart identities`, () => { helpers.cleanTables(db) });

    beforeEach('seed db', () => 
        helpers.seedTables(
            db,
          testUsers,
          testPeople,
          testRmbrs,
        )
    );

    const protectedEndpoints = [
        {
            name: `GET /api/people`,
            path: `/api/people`,
            method: supertest(app).get
        },
        {
            name: `POST /api/people`,
            path: `/api/people`,
            method: supertest(app).get
        },
        {
            name: `GET /api/people/:person_id`,
            path: `/api/people/:person_id`,
            method: supertest(app).get
        },
        {
            name: `PATCH /api/people/:person_id`,
            path: `/api/people/:person_id`,
            method: supertest(app).get
        },
        {
            name: `DELETE /api/people/:person_id`,
            path: `/api/people/:person_id`,
            method: supertest(app).get
        },
        {
            name: `GET /api/rmbrs`,
            path: `/api/rmbrs`,
            method: supertest(app).get
        },
        {
            name: `POST /api/rmbrs`,
            path: `/api/rmbrs`,
            method: supertest(app).get
        },
        {
            name: `GET /api/rmbrs/:rmbr_id`,
            path: `/api/rmbrs/:rmbr_id`,
            method: supertest(app).get
        },
        {
            name: `PATCH /api/rmbrs/:rmbr_id`,
            path: `/api/rmbrs/:rmbr_id`,
            method: supertest(app).get
        },
        {
            name: `DELETE /api/rmbrs/:rmbr_id`,
            path: `/api/rmbrs/:rmbr_id`,
            method: supertest(app).get
        }
    ];

    protectedEndpoints.forEach(endpoint => {

        describe(endpoint.name, () => {

            it(`responds 401 'Missing bearer token' when no bearer token`, () => {
                return endpoint.method(endpoint.path)
                    .expect(401, {
                        error: `Missing bearer token` 
                    });
            });

            it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
                const validUser = testUsers[0];
                const invalidSecret = 'bad-secret';
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                    .expect(401, {
                        error: `Unauthorized request`
                    });
            })

            it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
                const invalidUser = {
                    user_name: 'user-not-existy',
                    id: 1
                }
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(invalidUser))
                    .expect(401, {
                        error: `Unauthorized request`
                    })
            });
            
        });
    });
});