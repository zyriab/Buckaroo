import { fetchUpUrlQuery } from '../../helpers/test-queries.help';
import { createReadStream, statSync } from 'fs';
import app from '../../app';
import supertest from 'supertest';
import fetch from 'cross-fetch';

const request = supertest(app);

let uploadUrl: string;

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

// TODO: upload example.txt
test('Fetching pre-signed upload URL for example.txt', (done) => {
  const query = fetchUpUrlQuery;
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
      expect(res.body.data.getUploadUrl.url).not.toBeNull();
      expect(res.body.data.getUploadUrl.url).toContain('aws');
      uploadUrl = res.body.data.getUploadUrl.url;
      done();
    });
});

test('Uploading example.txt with pre-signed URL', async () => {
  const filePath = './src/pseudo/example.txt'
  const payload = createReadStream(filePath);

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      "Content-Length": `${statSync(filePath).size}`
    },
    // @ts-ignore
    body: payload,
  });

  expect(res.status).toBe(200);
});
