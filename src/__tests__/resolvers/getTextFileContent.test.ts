/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import supertest from 'supertest';
import app from '../../app';
import client from '../../helpers/mockClient.help';
import { getTextFileContentQuery } from '../../helpers/testQueries.help';
import 'dotenv/config';

const request = supertest(app);

const fileName = 'example.txt';
const path = 'translations';
const versionId = 'abcd';
const s3MockClient = client();

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.TEST_AUTH = 'true';
  s3MockClient.client.reset();
  s3MockClient.setup();
});

afterAll(() => {
  process.env.TEST_AUTH = 'false';
});

test('Should get specified file content', (done) => {
  const query = getTextFileContentQuery;
  query.variables.fileName = fileName;
  query.variables.path = path;
  query.variables.root = undefined;
  query.variables.versionId = undefined;

  request
    .post('/gql')
    .send(query)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err: any, res: any) => {
      if (err) return done(err);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.data.getTextFileContent).not.toBeUndefined();
      expect(res.body.data.getTextFileContent.__typename).toBe(
        'TextFileContent'
      );
      expect(res.body.data.getTextFileContent.content).toBe('Latest');
      done();
    });
});

test('Should get specified file version content', (done) => {
  const query = getTextFileContentQuery;
  query.variables.fileName = fileName;
  query.variables.path = path;
  query.variables.root = undefined;
  query.variables.versionId = versionId;

  request
    .post('/gql')
    .send(query)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err: any, res: any) => {
      if (err) return done(err);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.data.getTextFileContent).not.toBeUndefined();
      expect(res.body.data.getTextFileContent.__typename).toBe(
        'TextFileContent'
      );
      expect(res.body.data.getTextFileContent.content).toBe('Older');
      done();
    });
});

test('Should be blocked when trying to read a file (Unauthorized)', (done) => {
  const query = getTextFileContentQuery;
  query.variables.fileName = fileName;
  query.variables.path = path;
  query.variables.root = 'other-user-1234abcd';
  query.variables.versionId = undefined;

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
      expect(res.body.data.getTextFileContent).not.toBeUndefined();
      expect(res.body.data.getTextFileContent.__typename).toBe('Unauthorized');
      done();
    });
});
