const app = require('../src/server')

describe('App tests', () => {
    it(`GET / responds with 200 containing 'Server's buns are buttered'`, () => {
        return (
            supertest(app)
                .get('/')
                .expect(200, `Server's buns are buttered`)
        );
    });
});