import { fetchDlUrlQuery } from '../../helpers/test-queries.help';
import app from '../../app';
import supertest from 'supertest';
import fetch from 'cross-fetch';

const request = supertest(app);

let downloadUrl: string;

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

test('Fetching pre-signed download URL for example.txt', (done) => {
  const query = fetchDlUrlQuery;
  query.variables.fileName = 'example.txt';
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
      expect(res.body.data.getDownloadUrl.url).not.toBeNull();
      expect(res.body.data.getDownloadUrl.url).toContain('aws');
      expect(res.body.data.getDownloadUrl.url).not.toContain('undefined');
      downloadUrl = res.body.data.getDownloadUrl.url;
      done();
    });
});

test('Fetching example.txt with pre-signed URL', async () => {
  const res = await fetch(downloadUrl);
  expect(res.status).toBe(200);
});
