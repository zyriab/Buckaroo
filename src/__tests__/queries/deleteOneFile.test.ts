import { deleteFileQuery } from '../../helpers/test-queries.help';
import supertest from 'supertest';
import app from '../../app';

const request = supertest(app);

beforeAll(async () => {
  process.env.NODE_ENV === 'test';
});

// TODO: upload example.txt first

test('Delete file example.txt', (done) => {
  const query = deleteFileQuery;
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
      expect(res.body.data.deleteOneFile.name).not.toBeNull();
      expect(res.body.data.deleteOneFile.name).toMatch('example.txt');
      done();
    });
});
