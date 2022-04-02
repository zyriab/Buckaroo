import { restoreFileVersionQuery } from '../../helpers/test-queries.help';
import { getAllFileVersions } from '../../utils/s3/getAllFileVersions';
import fakeReq from '../../helpers/mock-request.help';
import app from '../../app';
import supertest from 'supertest';

const request = supertest(app);
let v: string[] | undefined;

beforeAll(async () => {
  process.env.NODE_ENV === 'test';
  [, v] = await getAllFileVersions({
    req: fakeReq,
    fileName: 'example.txt',
    path: 'translations',
  });
});

test('Restoring older version of example.txt', (done) => {
  const query = restoreFileVersionQuery;
  query.variables.versionId = v![v!.length - 1];

  request
    .post('/gql')
    .send(query)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err: any, res: any) => {
      if (err) return done(err);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.data.restoreFileVersion.id).not.toBeNull();
      done();
    });
});
