/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-shadow */
import supertest from 'supertest';
import app from '../../app';
import { restoreFileVersionQuery } from '../../helpers/testQueries.help';
import getOneFileVersionsIds from '../../utils/s3/getOneFileVersionsIds';
import fakeReq from '../../helpers/mockRequest.help';
import { deleteOneFile, getUploadUrl } from '../../utils/s3.utils';
import { uploadFileToS3 } from '../../helpers/downloadUpload.help';

const request = supertest(app);

let e: any;
let v: any;
let errors: any[];
let urls: any[];
let res: any[];
const fileName = 'example3.txt';
const path = 'translations';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.TEST_AUTH = 'true';

  errors = [];
  urls = ([] as string[]) || undefined;
  res = [];

  for (let i = 0; i < 3; i+=1) {
    // eslint-disable-next-line no-await-in-loop
    const [err, url] = await getUploadUrl({
      req: fakeReq,
      fileName,
      path,
      root: 'test-user-1234abcd',
    });
    errors.push(err);
    urls.push(`${url}`);
  }

  if (!urls.includes('undefined')) {
    for (const u of urls)
      // eslint-disable-next-line no-await-in-loop
      res.push(await uploadFileToS3(u, './src/pseudo/', fileName));
  }

  [e, v] = await getOneFileVersionsIds({
    req: fakeReq,
    fileName,
    path,
    root: 'test-user-1234abcd',
  });
});

afterAll(async () => {
  if (process.env.TEST_AUTH === 'true')
    await deleteOneFile({
      req: fakeReq,
      fileName,
      path,
      root: 'test-user-1234abcd',
    });
  process.env.TEST_AUTH = 'false';
});

test('Should restore older version of file', (done) => {
  for (const err of errors) expect(err).toBeUndefined();
  expect(e).toBeUndefined();
  expect(v.length).toBeGreaterThan(0);

  const query = restoreFileVersionQuery;
  query.variables.fileName = fileName;
  query.variables.path = path;
  query.variables.versionId = v[v.length - 1];
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
        req: fakeReq,
        fileName,
        path,
        root: 'test-user-1234abcd',
      }).then((ids) => {
        expect(ids).not.toContain(v[v.length - 1]);
        expect(ids[1]![0]).toBe(res.body.data.restoreFileVersion.id);
        done();
      });
    });
});

test('Should be blocked when restoring older version of file (Unauthorized)', (done) => {
  for (const err of errors) expect(err).toBeUndefined();
  expect(e).toBeUndefined();
  expect(v.length).toBeGreaterThan(0);

  process.env.TEST_AUTH = 'false';

  const query = restoreFileVersionQuery;
  query.variables.fileName = fileName;
  query.variables.path = path;
  query.variables.versionId = v[v.length - 1];
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
