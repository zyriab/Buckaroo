/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
import supertest from 'supertest';
import app from '../../app';
import { listQuery } from '../../helpers/testQueries.help';
import client from '../../helpers/mockClient.help';
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

afterAll(async () => {
  process.env.TEST_AUTH = 'false';
});

test("Should query and list current user's directory content", (done) => {
  const query = listQuery;
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
      expect(res.body.data.listBucketContent.list).not.toBeUndefined();
      expect(res.body.data.listBucketContent.list.length).toBe(2);
      expect(res.body.data.listBucketContent.list[0].name).toBe(fileName);
      done();
    });
});

test("Should query and list other user's directory content", (done) => {
  const query = listQuery;
  query.variables.path = path;
  query.variables.root = 'other-user-1234abcd/';

  request
    .post('/gql')
    .send(query)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err: any, res: any) => {
      if (err) return done(err);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.data.listBucketContent).not.toBeUndefined();
      expect(res.body.data.listBucketContent.__typename).toBe('FileList');
      expect(res.body.data.listBucketContent.list).not.toBeUndefined();
      done();
    });
});

test('Should query and list an empty folder (non-existant folder)', (done) => {
  const query = listQuery;
  query.variables.path = path;
  query.variables.root = '';

  request
    .post('/gql')
    .send(query)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err: any, res: any) => {
      if (err) return done(err);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.data.listBucketContent.list).not.toBeUndefined();
      expect(res.body.data.listBucketContent.list.length).toBe(0);
      done();
    });
});

test("Should be blocked when querying and list other user's directory content (Unauthorized)", (done) => {
  const query = listQuery;
  query.variables.path = path;
  query.variables.root = 'other-user-1234abcd/';

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
      expect(res.body.data.listBucketContent).not.toBeUndefined();
      expect(res.body.data.listBucketContent.__typename).toBe('Unauthorized');
      done();
    });
});
