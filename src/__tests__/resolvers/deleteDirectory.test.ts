/* eslint-disable no-console */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import supertest from 'supertest';
import app from '../../app';
import req from '../../helpers/mockRequest.help';
import { deleteDirectoryQuery } from '../../helpers/testQueries.help';
import 'dotenv/config';
import { getUploadUrl } from '../../utils/s3.utils';
import { uploadFileToS3 } from '../../helpers/downloadUpload.help';

const request = supertest(app);

const dirPath = 'some-user/';
const bucketName = '';
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.TEST_AUTH = 'true';

  const [err, post] = await getUploadUrl({
    req,
    fileName: 'example.txt',
    fileType: 'text',
    path: 'translations',
    root: 'another-user',
  });

  const [err2, post2] = await getUploadUrl({
    req,
    fileName: 'example.txt',
    fileType: 'text',
    path: 'products',
    root: 'another-user',
  });

  if (err) console.error(err);
  else if (err2) console.error(err2);
  else {
    uploadFileToS3(post.url, post.fields, './src/pseudo/', 'example.txt');
    uploadFileToS3(post2.url, post2.fields, './src/pseudo/', 'example.txt');
  }
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
      expect(res.body.data.deleteDirectory.__typename).toBe('Directory');
      expect(res.body.data.deleteDirectory.name).toBe(`${dirPath}`);
      expect(res.body.data.deleteDirectory.path).toBe('/');
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
