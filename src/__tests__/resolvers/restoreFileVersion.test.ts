/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-shadow */
import supertest from 'supertest';
import app from '../../app';
import getOneFileVersionsIds from '../../utils/s3/getOneFileVersionsIds';
import { restoreFileVersionQuery } from '../../helpers/testQueries.help';
import client from '../../helpers/mockClient.help';
import req from '../../helpers/mockRequest.help';
import 'dotenv/config';

const request = supertest(app);

const fileName = 'example.txt';
const path = 'translations';
const versionId = 'abcdefgh12345678';
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

test('Should restore older version of file', (done) => {
  const query = restoreFileVersionQuery;
  query.variables.fileName = fileName;
  query.variables.path = path;
  query.variables.versionId = versionId;
  query.variables.root = undefined;

  request
    .post('/gql')
    .send(query)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err: any, res: any) => {
      if (err) return done(err);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.data.restoreFileVersion).not.toBeUndefined();
      expect(res.body.data.restoreFileVersion.__typename).toBe('VersionId');
      expect(res.body.data.restoreFileVersion.id).not.toBeUndefined();

      getOneFileVersionsIds({
        req,
        fileName,
        path,
        root: 'test-user-1234abcd',
        bucketName: `${process.env.BUCKET_NAMESPACE}test-bucket-app`,
      }).then((ids) => {
        expect(ids).not.toContain(versionId);
        expect(ids[1]![0]).toBe(res.body.data.restoreFileVersion.id);
        done();
      });
    });
});

test('Should be blocked when restoring older version of file (Unauthorized)', (done) => {
  process.env.TEST_AUTH = 'false';

  const query = restoreFileVersionQuery;
  query.variables.fileName = fileName;
  query.variables.path = path;
  query.variables.versionId = versionId;
  query.variables.root = 'other-user-1234abcd';

  request
    .post('/gql')
    .send(query)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err: any, res: any) => {
      if (err) return done(err);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.data.restoreFileVersion).not.toBeUndefined();
      expect(res.body.data.restoreFileVersion.__typename).toBe('Unauthorized');
      process.env.TEST_AUTH = 'true';
      done();
    });
}, 10000);
