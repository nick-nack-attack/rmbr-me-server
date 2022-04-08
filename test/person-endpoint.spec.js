import app from '../src/server.ts';
import knex from 'knex';
import helpers from './test-helpers';
import describe from "mocha";

describe('Person Endpoint', () => {

  let db;

  // create db schema as JS objects
  const {
    testUserArray,
    testPersonArray,
    testRmbrArray,
  } = helpers.makeFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  })

  after(`disconnect from database`, () => { return db.destroy() });
  beforeEach(`truncate database and restart identities`, () => { return helpers.cleanTables(db) });
  afterEach(`truncate database and restart identities`, () => { return helpers.cleanTables(db) });

  describe(`GET /api/person`, () => {

    context(`empty person table in database`, () => {

      beforeEach('seed db', () => {
        return (
          helpers.seedTables(
            db,
            testUserArray,
            [],
            [],
          )
        );
      });

      it(`responds 200 and an empty array`, () => {
        return (
          supertest(app)
            .get('/api/person')
            .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
            .expect(200, [])
        );
      });

    });

    context(`Given there is one person (or more)`, () => {

      beforeEach('seed db', () =>
        helpers.seedTables(
          db,
          testUserArray,
          testPersonArray,
          [],
        )
      );

      it(`responds 200 and all person(s)`, () => {
        const expectedPersonArray =
          testPersonArray.map(person => {
            return (
              helpers.makeExpectedPerson(person)
            );
          });
          return (
            supertest(app)
              .get('/api/person')
              .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
              .expect(200, expectedPersonArray)
          );
      });
    });

  });

  describe(`GET /api/person/:person_id`, () => {

    context(`empty person table in database`, () => {

      beforeEach('seed db', () =>
        helpers.seedTables(
          db,
          testUserArray,
          [],
          [],
        )
      );

      it(`responds with 404`, () => {
        return (
          supertest(app)
            .get(`/api/person/1`)
            .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
            .expect(404, {
              error: `Person doesn't exist`
            })
        );
      });

    });

    context('Given there is one person (or more)', () => {

      beforeEach('seed database', () =>
        helpers.seedTables(
          db,
          testUserArray,
          testPersonArray,
          testRmbrArray,
        )
      );

      it('responds 200 and specified person', () => {
        const person_id = 1
        const expectedPerson = helpers.makeExpectedPerson(testPersonArray[person_id - 1]);
        return (
          supertest(app)
            .get(`/api/person/${person_id}`)
            .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
            .expect(200, expectedPerson)
        );
      });
    });
  });

  describe(`POST /api/person`, () => {

    context(`empty person table in database`, () => {

      beforeEach('seed db', () => {
        return (
          helpers.seedTables(
            db,
            testUserArray,
            [],
            [],
          )
        );
      });

      it(`responds 201 and new person`, function() {
        this.retries(3);
        const testUser = testUserArray[0];
        const newPerson = {
          person_name: 'Test Person',
          type_of_person: 'Friend',
          user_id: testUser.id
        };
        return (
          supertest(app)
            .post(`/api/person`)
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .send(newPerson)
            .expect(201)
            .expect(res => {
              expect(res.body).to.have.property('id');
              expect(res.body.person_name).to.eql(newPerson.person_name);
              expect(res.body.user_id).to.eql(testUser.id);
              expect(res.headers.location).to.eql(`/api/person/${res.body.id}`);
              const expectedDateCreated = new Date().toLocaleString();
              const actualDateCreated = new Date(res.body.date_created).toLocaleString();
              expect(expectedDateCreated).to.eql(actualDateCreated);
            })
        )
      });
    });
  });

  describe(`DELETE /api/person/:person_id`, () => {

    context(`empty person table in database`, () => {

      beforeEach('seed db', () => {
        return (
          helpers.seedTables(
            db,
          testUserArray,
          testPersonArray,
          testRmbrArray,
          )
        );
      });

      it(`responds 404`, () => {
        const person_id = 1000;
        return (
          supertest(app)
            .delete(`/api/person/${person_id}`)
            .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
            .expect(404, {
              error: `Person doesn't exist`
            })
        )
      });
  });

  context(`given person exists`, () => {

    beforeEach('seed db', () => {
      return (
        helpers.seedTables(
          db,
          testUserArray,
          testPersonArray,
          testRmbrArray,
        )
      );
    });

    it(`responds 204 and person is deleted`, () => {
      const person_id = 1;
      return (
        supertest(app)
          .delete(`/api/person/${person_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
          .expect(204)
          .then(() => {
            // verify we receive 404 when querying person
            return (
              supertest(app)
                .get(`/api/person/${person_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
                .expect(404)
            );
          })
      );
    });
  });
  });

  describe(`PATCH /api/person/:person_id`, () => {

    context(`given person does NOT exist`, () => {

      beforeEach('seed db', () => {
        return (
          helpers.seedTables(
            db,
          testUserArray,
          testPersonArray,
          testRmbrArray,
          )
        );
      });

      it(`responds 404`, () => {
        const person_id = 1000;
        const updatedPerson = {
          person_name: 'This is a New Name'
        };
        return (
          supertest(app)
            .patch(`/api/person/${person_id}`)
            .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
            .send(updatedPerson)
            .expect(404, {
              error: `Person doesn't exist`
            })
        )
      });
    });

    context(`given person EXISTS`, () => {

      beforeEach('seed db', () => {
        return (
          helpers.seedTables(
            db,
            testUserArray,
            testPersonArray,
            testRmbrArray,
          )
        );
      });

      it(`responds 200 and person is updated`, function() {
        this.retries(3);
        const person_id = 1;
        const updatedPerson = {
          person_name: 'NEW NAME!!!',
          user_id: 1,
          type_of_person: 'Friend'
        };

        const expectedPerson = {
          ...testPersonArray[person_id - 1],
          ...updatedPerson,
          date_modified: new Date().toLocaleString(),
          date_created: new Date(testPersonArray[person_id - 1].date_created).toLocaleString()
        };

        return (
          supertest(app)
            .patch(`/api/person/${person_id}`)
            .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
            .send(updatedPerson)
            .expect(200)
            .then(res => {
              return (
                supertest(app)
                  .get(`/api/person/${person_id}`)
                  .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
                  .send(updatedPerson)
                  .expect(200)
                  .then(res => {
                    return (
                      supertest(app)
                        .get(`/api/person/${person_id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUserArray[0]))
                        .expect(200)
                        .expect(res => {
                          const actualDateModified = new Date(res.body.date_modified).toLocaleString();
                          const actualDateCreated = new Date(res.body.date_created).toLocaleString();
                          expect(expectedPerson.date_modified.hours).to.eql(actualDateModified.hours);
                          expect(expectedPerson.date_modified.day).to.eql(actualDateModified.day);
                          expect(expectedPerson.date_created.hours).to.eql(actualDateCreated.hours);
                          expect(expectedPerson.date_created.day).to.eql(actualDateCreated.day);
                        })
                    );
                  })
              );
            })
        )
      });

    });

  });

})
