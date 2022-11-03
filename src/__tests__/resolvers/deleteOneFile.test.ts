/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import supertest from 'supertest';
import app from '../../app';
import client from '../../helpers/mockClient.help';
import { deleteFileQuery } from '../../helpers/testQueries.help';
import 'dotenv/config';

const request = supertest(app);

const fileName = 'example.txt';
const path = 'translations';
const s3MockClient = client();

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.TEST_AUTH = 'true';
});

beforeEach(() => {
  s3MockClient.client.reset();
  s3MockClient.setup();
});

afterAll(() => {
  process.env.TEST_AUTH = 'false';
});

test('Should delete specified file', (done) => {
  const query = deleteFileQuery;
  query.variables.fileName = fileName;
  query.variables.path = path;

  request
    .post('/gql')
    .send(query)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err: any, res: any) => {
      if (err) return done(err);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.data.deleteOneFile).not.toBeUndefined();
      expect(res.body.data.deleteOneFile.__typename).toBe('FileName');
      expect(res.body.data.deleteOneFile.name).toMatch(fileName);
      done();
    });
});

test('Should be blocked when deleting specified file from root (Unauthorized)', (done) => {
  const query = deleteFileQuery;
  query.variables.fileName = fileName;
  query.variables.path = path;
  query.variables.root = 'other-user-1234abcd';

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
      expect(res.body.data.deleteOneFile).not.toBeUndefined();
      expect(res.body.data.deleteOneFile.__typename).toBe('Unauthorized');
      done();
    });
});
