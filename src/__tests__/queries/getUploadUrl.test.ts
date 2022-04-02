import { fetchUpUrlQuery } from '../../helpers/test-queries.help';
import { createReadStream } from 'fs';
import app from '../../app';
import supertest from 'supertest';

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
      expect(res.body.data.getUploadUrl.fields).toBeInstanceOf(Object);
      uploadUrl = res.body.data.getUploadUrl.url;
      console.log(uploadUrl)
      done();
    });
});

// test('Uploading example.txt with pre-signed URL', async () => {
//   const form = new FormData();
//   for (const f of uploadUrl.fields) form.append(f.key, f.value);

//   form.append(
//     'test-user-1234abcd/translations/example.txt',
//     createReadStream('./example.txt')
//   );

//   const res = await fetch(uploadUrl.url, {
//     method: 'POST',
//     //@ts-ignore
//     body: form,
//   });

//   expect(res.status).toBe(200);
// });
