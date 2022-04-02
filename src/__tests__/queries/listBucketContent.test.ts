import { listQuery } from '../../helpers/test-queries.help';
import supertest from 'supertest';
import app from '../../app';

const request = supertest(app);

beforeAll(async () => {
  process.env.NODE_ENV === 'test';
});

test('Listing test-user directory content', (done) => {
  const query = listQuery;
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
      expect(res.body.data.listBucketContent.list.length).not.toBeNull();
      done();
    });
});
