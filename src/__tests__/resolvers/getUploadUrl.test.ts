import { fetchUpUrlQuery } from '../../helpers/testQueries.help';
import { uploadFileToS3 } from '../../helpers/downloadUpload.help';
import { deleteOneFile } from '../../utils/s3.utils';
import app from '../../app';
import supertest from 'supertest';
import fakeReq from '../../helpers/mockRequest.help';

const request = supertest(app);

let uploadUrl: string;
const fileName = 'example.txt';
const path = 'translations';
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.TEST_AUTH = 'true';
});

afterAll(() => {
  deleteOneFile({ req: fakeReq, fileName, path });
  process.env.TEST_AUTH = 'false';
});

test('Should fetch pre-signed upload URL for <user-folder>/translations/example.txt', (done) => {
  const query = fetchUpUrlQuery;
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
      expect(res.body.data.getUploadUrl.url).not.toBeUndefined();
      uploadUrl = res.body.data.getUploadUrl.url;
      done();
    });
});

test('Should upload example.txt with pre-signed URL', async () => {
  const res = await uploadFileToS3(uploadUrl, './src/pseudo/', fileName);
  expect(res.status).toBe(200);
});
