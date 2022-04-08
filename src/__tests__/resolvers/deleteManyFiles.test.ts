/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import supertest from 'supertest';
import app from '../../app';
import { deleteManyFileQuery } from '../../helpers/testQueries.help';
import { getUploadUrl } from '../../utils/s3.utils';
import fakeReq from '../../helpers/mockRequest.help';
import { uploadFileToS3 } from '../../helpers/downloadUpload.help';

const request = supertest(app);

let err1: any;
let err2: any;
let url1: any;
let url2: any;
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.TEST_AUTH = 'true';

  [err1, url1] = await getUploadUrl({
    req: fakeReq,
    fileName: 'example.txt',
    fileType: 'text',
    path: 'translations',
    root: 'test-user-1234abcd',
  });
  [err2, url2] = await getUploadUrl({
    req: fakeReq,
    fileName: 'example2.txt',
    fileType: 'text',
    path: 'translations',
    root: 'test-user-1234abcd',
  });
  if (!err1 && !err2) {
    uploadFileToS3(url1.url, url1.fields, './src/pseudo/', 'example.txt');
    uploadFileToS3(url2.url!, url2.fields, './src/pseudo/', 'example2.txt');
  }
});

afterAll(() => {
  process.env.TEST_AUTH = 'false';
});

test('Should delete files example.txt & example2.txt', (done) => {
  expect(err1).toBeUndefined();
  expect(err2).toBeUndefined();

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
  expect(err1).toBeUndefined();
  expect(err2).toBeUndefined();

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
