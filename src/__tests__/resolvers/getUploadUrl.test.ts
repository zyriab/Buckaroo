/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
import supertest from 'supertest';
import app from '../../app';
import { fetchUpUrlQuery } from '../../helpers/testQueries.help';
import { uploadFileToS3 } from '../../helpers/downloadUpload.help';
import { deleteOneFile } from '../../utils/s3.utils';
import req from '../../helpers/mockRequest.help';

const request = supertest(app);

let uploadUrl: string;
let uploadFields: Object;
const fileName = 'example.txt';
const path = 'translations';
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.TEST_AUTH = 'true';
});

afterAll(() => {
  deleteOneFile({ req, fileName, path, root: 'test-user-1234abcd' });
  process.env.TEST_AUTH = 'false';
});

test('Should fetch pre-signed upload URL for <user-folder>/translations/example.txt', (done) => {
  const query = fetchUpUrlQuery;
  query.variables.fileName = fileName;
  query.variables.path = path;
  query.variables.fileType = 'text';

  request
    .post('/gql')
    .send(query)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err: any, res: any) => {
      if (err) return done(err);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.data.getUploadUrl).not.toBeUndefined();
      expect(res.body.data.getUploadUrl.__typename).toBe('SignedPost');
      expect(res.body.data.getUploadUrl.url).not.toBeUndefined();
      uploadUrl = res.body.data.getUploadUrl.url;
      uploadFields = res.body.data.getUploadUrl.fields;
      done();
    });
});

test('Should upload example.txt with pre-signed URL', async () => {
  uploadFileToS3(uploadUrl, uploadFields, './src/pseudo/', fileName);
});
