import app from '../src/server.ts';
import knex from 'knex';
import helpers from './test-helpers';

describe('protected endpoint', () => {
    let db;
    // create db schema as JS objects
    const { testUserArray, testPersonArray, testRmbrArray } = helpers.makeFixtures();

    before('connect to db', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        });
        app.set('db', db);
    });
    after(`disconnect from database`, () => { db.destroy() });
    beforeEach(`truncate database and restart identities`, () => { helpers.cleanTables(db) });
    afterEach(`truncate database and restart identities`, () => { helpers.cleanTables(db) });

    beforeEach('seed db', () =>
        helpers.seedTables(
            db,
            testUserArray,
            testPersonArray,
            testRmbrArray,
        )
    );

    const protectedEndpointArray = [
        {
            name: `GET /api/person`,
            path: `/api/person`,
            method: supertest(app).get,
        },
        {
            name: `POST /api/person`,
            path: `/api/person`,
            method: supertest(app).get,
        },
        {
            name: `GET /api/person/:person_id`,
            path: `/api/person/1`,
            method: supertest(app).get,
        },
        {
            name: `PATCH /api/person/:person_id`,
            path: `/api/person/1`,
            method: supertest(app).get,
        },
        {
            name: `DELETE /api/person/:person_id`,
            path: `/api/person/1`,
            method: supertest(app).get,
        },
        {
            name: `GET /api/rmbr`,
            path: `/api/rmbr`,
            method: supertest(app).get,
        },
        {
            name: `POST /api/rmbr`,
            path: `/api/rmbr`,
            method: supertest(app).get,
        },
        {
            name: `GET /api/rmbr/:rmbr_id`,
            path: `/api/rmbr/1`,
            method: supertest(app).get,
        },
        {
            name: `PATCH /api/rmbr/:rmbr_id`,
            path: `/api/rmbr/1`,
            method: supertest(app).get,
        },
        {
            name: `DELETE /api/rmbr/:rmbr_id`,
            path: `/api/rmbr/1`,
            method: supertest(app).get,
        }
    ];

    protectedEndpointArray.forEach(endpoint => {

        describe('endpoint.name', () => {

            it(`responds 401 'Missing bearer token' when no bearer token on endpoint ${endpoint.name}`, () => {
                return endpoint.method(endpoint.path)
                    .expect(401, {
                        error: `Missing bearer token`
                    });
            });

            it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
                const validUser = testUserArray[0];
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
