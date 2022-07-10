/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import supertest from 'supertest';
import app from '../../app';
import client from '../../helpers/mockClient.help';
import { getTextFileContentQuery } from '../../helpers/testQueries.help';
import 'dotenv/config';

const request = supertest(app);

const fileName = 'example.txt';
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
      expect(res.body.data.getTextFileContent.content).toBe('test123');
      done();
    });
});
