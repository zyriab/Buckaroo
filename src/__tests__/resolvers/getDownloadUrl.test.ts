/* eslint-disable no-console */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-shadow */
import supertest from 'supertest';
import app from '../../app';
import { fetchDlUrlQuery } from '../../helpers/testQueries.help';
import {
  downloadFileLocally,
  uploadFileToS3,
} from '../../helpers/downloadUpload.help';
import { getUploadUrl, deleteOneFile } from '../../utils/s3.utils';
import req from '../../helpers/mockRequest.help';

const request = supertest(app);

let downloadUrl: string;
let err: any;
let url: any;
const fileName = 'example.txt';
const path = 'translations';
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.TEST_AUTH = 'true';

  [err, url] = await getUploadUrl({
    req,
    fileName,
    fileType: 'text',
    path,
    root: 'test-user-1234abcd',
  });

  if (!err) {
    uploadFileToS3(url.url!, url.fields, './src/pseudo/', 'example.txt');
  }
});

afterAll(async () => {
  const [err] = await deleteOneFile({
    req,
    fileName,
    root: 'test-user-1234abcd',
    path,
  });

  if (err) console.error(err);

  process.env.TEST_AUTH = 'false';
});

test('Should fetch pre-signed download URL for <user-folder>/translations/example.txt', (done) => {
  expect(err).toBeUndefined();

  const query = fetchDlUrlQuery;
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
      expect(res.body.data.getDownloadUrl).not.toBeUndefined();
      expect(res.body.data.getDownloadUrl.__typename).toBe('SignedUrl');
      expect(res.body.data.getDownloadUrl.url).not.toBeUndefined();
      expect(res.body.data.getDownloadUrl.url).not.toContain('undefined');
      downloadUrl = res.body.data.getDownloadUrl.url;
      done();
    });
});

test('Should download and save example.txt locally with pre-signed URL', async () => {
  const res = await downloadFileLocally(downloadUrl, './src/pseudo/', fileName);
  expect(res.status).toBe(200);
});

test('Should be blocked when fetching pre-signed download URL for <user-folder>/translations/example.txt (Unauthorized)', (done) => {
  expect(err).toBeUndefined();

  const query = fetchDlUrlQuery;
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
      expect(res.body.data.getDownloadUrl).not.toBeUndefined();
      expect(res.body.data.getDownloadUrl.__typename).toBe('Unauthorized');
      done();
    });
});
