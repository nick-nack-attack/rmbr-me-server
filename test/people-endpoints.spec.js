const app = require('../src/app')
const knex = require('knex')
const helpers = require('./test-helpers')

describe('People Endpoints', () => {

  let db;

  // create db schema as JS objects
  const {
    testUsers,
    testPeople,
    testRmbrs,
  } = helpers.makeFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  })

  after(`disconnect from database`, () => { return db.destroy() });
  before(`truncate database and restart identities`, () => { return helpers.cleanTables(db) });
  afterEach(`truncate database and restart identities`, () => { return helpers.cleanTables(db) });

  describe(`GET /api/people`, () => {

    context(`Given no people`, () => {

      beforeEach('seed db', () => {
        return (
          helpers.seedTables(
            db,
            testUsers,
            []
          )
        );
      });

      it(`responds 200 and an empty array`, () => {
        return (
          supertest(app)
            .get('/api/people')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(200, [])
        );
      });

    });

    context(`Given there ARE people`, () => {

      beforeEach('seed db', () =>
        helpers.seedTables(
          db,
          testUsers,
          testPeople,
          testRmbrs,
        )
      );

      it(`responds 200 and all people`, () => {
        const expectedPeople = 
          testPeople
          .filter(person => person.user_id === testUsers[0].id)
          .map(person => {
            return (
              helpers.makeExpectedPerson(person)
            );
          });
          return (
            supertest(app)
              .get('/api/projects')
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(200, expectedPeople)
          ); 
      });
      
    });

  });

  describe(`GET /api/people/:person_id`, () => {

    context(`Given no people`, () => {

      beforeEach('seed db', () => 
        helpers.seedTables(
          db,
          testUsers,
          []
        )
      );

      it(`responds with 404`, () => {
        return (
          supertest(app)
            .get(`/api/people/1`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(404, {
              error: `Person doesn't exist`
            })
        );
      });

    });

    context('Given there ARE people', () => {

      beforeEach('seed database', () =>
        helpers.seedTables(
          db,
          testUsers,
          testPeople,
          testRmbrs
        )
      );

      it('responds 200 and specified person', () => {
        const personId = 1
        const expectedPerson = makeExpectedPerson(testPeople[personId - 1]);
        return (
          supertest(app)
            .get(`/api/people/${personId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(200, expectedPerson)
        );  
      });
    });
  });

  describe(`POST /api/projects`, () => {
    
    context(`Given no projects`, () => {

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

      it(`responds 201 and new person`, () => {
        this.retries(3);
        const testUser = testUsers[0];
        const newPerson = {
          person_name: 'Test Person',
          user_id: 1
        };
        return (
          supertest(app)
            .post(`/api/people`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(newPerson)
            .expect(201)
            .expect(res => {
              expect(res.body).to.have.property('id');
              expect(res.body.person_name).to.eql(newPerson.person_name);
              expect(res.body.user_id).to.eql(testUser.id);
              expect(res.headers.location).to.eql(`/api/projects/${res.body.id}`);
              const expectedDateCreated = new Date().toLocaleString();
              const actualDateCreated = new Date(res.body.date_created).toLocaleString();
              expect(expectedDateCreated).to.eql(actualDateCreated);
            })
        );
      });
    });
  });

  describe(`DELETE /api/people/:person_id`, () => {

    context(`Given person does not exist`, () => {

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

      it(`responds 404`, () => {
        const personId = 1000;
        return (
          supertest(app)
            .delete(`/api/people/${personId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
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
          testUsers,
          testPeople,
          testRmbrs
        )
      );
    });

    it(`responds 204 and person is deleted`, () => {
      const personId = 1;
      return (
        supertest(app)
          .delete(`/api/people/${personId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(204)
          .then(() => {
            // verify we receive 404 when querying person
            return (
              supertest(app)
                .get(`/api/person/${personId}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(404)
            );
          })
      );
    });
  });
  });

  describe(`PATCH /api/people/:person_id`, () => {

    context(`given person does NOT exist`, () => {

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

      it(`responds 404`, () => {
        const personId = 1000;
        const updatedPerson = {
          person_name: 'This is a New Name'
        };
        return (
          supertest(app)
            .patch(`/api/people/${personId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
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
            testUsers,
            testPeople,
            testRmbrs
          )
        );
      });

      it(`responds 200 and person is updated`, () => {
        this.retries(3);
        const personId = 1;
        const updatedPerson = {
          person_name: 'NEW NAME!'
        };

        const expectedPerson = {
          ...testPeople[personId - 1],
          ...updatedPerson,
          date_modified: new Date().toLocaleString(),
          date_created: new Date(testPeople[personId - 1].date_created).toLocaleString()
        };

        return (
          supertest(app)
            .patch(`/api/people/${personId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(updatedPerson)
            .expect(201)
            .then(res => {
              return (
                supertest(app)
                  .get(`/api/people/${personId}`)
                  .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                  .send(updatedPerson)
                  .expect(201)
                  .then(res => {
                    return (
                      supertest(app)
                        .get(`/api/people/${personId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(200)
                        .expect(res => {
                          const actualDateModified = new Date(res.body.date_modified).toLocaleString();
                          const actualDateCreated = new Date(res.body.date_created).toLocaleString();
                          expect(expectedPerson.date_modified).to.eql(actualDateModified);
                          expect(expectedPerson.date_created).to.eql(actualDateCreated);
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
