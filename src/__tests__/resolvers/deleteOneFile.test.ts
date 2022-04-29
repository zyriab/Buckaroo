/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-shadow */
import supertest from 'supertest';
import app from '../../app';
import { deleteFileQuery } from '../../helpers/testQueries.help';
import { uploadFileToS3 } from '../../helpers/downloadUpload.help';
import { getUploadUrl } from '../../utils/s3.utils';
import req from '../../helpers/mockRequest.help';

const request = supertest(app);

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
    bucketName: `${process.env.BUCKET_NAMESPACE}test-bucket-app`,
  });

  if (!err) {
    uploadFileToS3(url.url!, url.fields, './src/pseudo/', fileName);
  }
});

afterAll(() => {
  process.env.TEST_AUTH = 'false';
});

test('Should delete specified file', (done) => {
  expect(err).toBeUndefined();

  const query = deleteFileQuery;
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
      expect(res.body.data.deleteOneFile).not.toBeUndefined();
      expect(res.body.data.deleteOneFile.__typename).toBe('FileName');
      expect(res.body.data.deleteOneFile.name).toMatch(fileName);
      done();
    });
});

test('Should be blocked when deleting specified file from root (Unauthorized)', (done) => {
  expect(err).toBeUndefined();

  const query = deleteFileQuery;
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
      expect(res.body.data.deleteOneFile).not.toBeUndefined();
      expect(res.body.data.deleteOneFile.__typename).toBe('Unauthorized');
      done();
    });
});
