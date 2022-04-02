import { deleteDirectoryQuery } from '../../helpers/test-queries.help';
import app from '../../app';
import supertest from 'supertest';

const request = supertest(app);

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

test('someDir', (done) => {
  const query = deleteDirectoryQuery;
  query.variables.dirPath = 'some-user/';

  request
    .post('/gql')
    .send(query)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err: any, res: any) => {
      if (err) return done(err);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.data).not.toBeNull();
      console.log(res.body.data);
      done();
    });
});
