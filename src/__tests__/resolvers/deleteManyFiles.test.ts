import { deleteManyFileQuery } from '../../helpers/testQueries.help';
import { getUploadUrl } from '../../utils/s3.utils';
import fakeReq from '../../helpers/mockRequest.help';
import supertest from 'supertest';
import app from '../../app';
import { uploadFileToS3 } from '../../helpers/downloadUpload.help';

const request = supertest(app);

let err1: any, err2: any, url1: any, url2: any, res1: any, res2: any;
beforeAll(async () => {
  process.env.NODE_ENV === 'test';
  process.env.TEST_AUTH = 'true';

  [err1, url1] = await getUploadUrl({
    req: fakeReq,
    fileName: 'example.txt',
    path: 'translations',
  });
  [err2, url2] = await getUploadUrl({
    req: fakeReq,
    fileName: 'example2.txt',
    path: 'translations',
  });
  if (!err1 && !err2) {
    res1 = await uploadFileToS3(url1!, './src/pseudo/', 'example.txt');
    res2 = await uploadFileToS3(url2!, './src/pseudo/', 'example2.txt');
  }
});

afterAll(() => {
  process.env.TEST_AUTH = 'false';
});

test('Should delete files example.txt & example2.txt', (done) => {
  expect(err1).toBeUndefined();
  expect(err2).toBeUndefined();
  expect(res1.status).toBe(200);
  expect(res2.status).toBe(200);

  const query = deleteManyFileQuery;
  query.variables.fileNames = ['example.txt', 'example2.txt'];
  query.variables.path = 'translations';
  query.variables.versionIds = [''];
  query.variables.rootPath = false;

  request
    .post('/gql')
    .send(query)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err: any, res: any) => {
      if (err) return done(err);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.data.deleteManyFiles.names).not.toBeUndefined();
      expect(res.body.data.deleteManyFiles.names[0]).toMatch('example.txt');
      expect(res.body.data.deleteManyFiles.names[1]).toMatch('example2.txt');
      done();
    });
});

test('Should be blocked when trying to delete files example.txt & example2.txt from root (Unauthorized)', (done) => {
  expect(err1).toBeUndefined();
  expect(err2).toBeUndefined();
  expect(res1.status).toBe(200);
  expect(res2.status).toBe(200);

  const query = deleteManyFileQuery;
  query.variables.fileNames = ['example.txt', 'example2.txt'];
  query.variables.path = 'translations';
  query.variables.versionIds = [''];
  query.variables.rootPath = true;

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
