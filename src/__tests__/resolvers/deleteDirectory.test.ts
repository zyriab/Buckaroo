import { deleteDirectoryQuery } from '../../helpers/testQueries.help';
import app from '../../app';
import supertest from 'supertest';

const request = supertest(app);

const dirPath = 'some-user/';
const bucketName = '';
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.TEST_AUTH = 'true';
});

afterAll(() => {
  process.env.TEST_AUTH = 'false';
});

test('Should try to delete non-existant folder some-user/', (done) => {
  const query = deleteDirectoryQuery;
  query.variables.dirPath = dirPath;
  query.variables.bucketName = bucketName;

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
      expect(res.body.data.deleteDirectory.name).toBe(`${dirPath}`);
      expect(res.body.data.deleteDirectory.path).toBe('/');
      done();
    });
});

test('Should be blocked when trying to delete a folder (Unauthorized)', (done) => {
  const query = deleteDirectoryQuery;
  query.variables.dirPath = dirPath;
  query.variables.bucketName = bucketName;

  process.env.TEST_AUTH = 'false';

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
      expect(res.body.data.deleteDirectory.__typename).toBe('Unauthorized');
      done();
    });
});
