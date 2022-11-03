/* eslint-disable no-console */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import supertest from 'supertest';
import app from '../../app';
import client from '../../helpers/mockClient.help';
import { deleteDirectoryQuery } from '../../helpers/testQueries.help';
import 'dotenv/config';

const request = supertest(app);

const dirPath = 'some-user/';
const bucketName = '';
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

test('Should delete folder another-user/ in test-bucket', (done) => {
  const query = deleteDirectoryQuery;
  query.variables.path = '';
  query.variables.root = 'another-user/';
  query.variables.bucketName = `${process.env.BUCKET_NAMESPACE}test-bucket-app`;

  request
    .post('/gql')
    .send(query)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err: any, res: any) => {
      if (err) return done(err);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.data.deleteDirectory).not.toBeUndefined();
      expect(res.body.data.deleteDirectory.__typename).toBe('Directory');
      expect(res.body.data.deleteDirectory.name).toBe(`another-user/`);
      expect(res.body.data.deleteDirectory.path).toBe('/');
      done();
    });
});

test('Should try to delete non-existant folder some-user/', (done) => {
  const query = deleteDirectoryQuery;
  query.variables.path = '';
  query.variables.root = dirPath;
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
      expect(res.body.data.deleteDirectory).not.toBeUndefined();
      expect(res.body.data.deleteDirectory.__typename).toBe('FileNotFound');
      done();
    });
});

test('Should be blocked when trying to delete a folder (Unauthorized)', (done) => {
  const query = deleteDirectoryQuery;
  query.variables.path = '';
  query.variables.root = dirPath;
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
      expect(res.body.data.deleteDirectory).not.toBeUndefined();
      expect(res.body.data.deleteDirectory.__typename).toBe('Unauthorized');
      done();
    });
});
