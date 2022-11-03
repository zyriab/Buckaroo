/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import supertest from 'supertest';
import app from '../../app';
import client from '../../helpers/mockClient.help';
import { deleteManyFileQuery } from '../../helpers/testQueries.help';
import 'dotenv/config';

const request = supertest(app);

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

test('Should delete files example.txt & example2.txt', (done) => {
  const query = deleteManyFileQuery;
  query.variables.fileNames = ['example.txt', 'example2.txt'];
  query.variables.path = 'translations';

  request
    .post('/gql')
    .send(query)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err: any, res: any) => {
      if (err) return done(err);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.data.deleteManyFiles).not.toBeUndefined();
      expect(res.body.data.deleteManyFiles.__typename).toBe('FileNameList');
      expect(res.body.data.deleteManyFiles.names).not.toBeUndefined();
      expect(res.body.data.deleteManyFiles.names[0]).toMatch('example.txt');
      expect(res.body.data.deleteManyFiles.names[1]).toMatch('example2.txt');
      done();
    });
});

test('Should be blocked when trying to delete files example.txt & example2.txt from root (Unauthorized)', (done) => {
  const query = deleteManyFileQuery;
  query.variables.fileNames = ['example.txt', 'example2.txt'];
  query.variables.path = 'translations';
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
      expect(res.body.data.deleteManyFiles).not.toBeUndefined();
      expect(res.body.data.deleteManyFiles.__typename).toBe('Unauthorized');
      done();
    });
});
