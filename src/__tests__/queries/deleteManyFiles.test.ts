import { deleteManyFileQuery } from "../../helpers/test-queries.help";
import supertest from "supertest";
import app from "../../app";


const request = supertest(app);

beforeAll(async () => {
  process.env.NODE_ENV === 'test';
});

// TODO: upload example.txt & example2.txt

test('Delete files example.txt & example2.txt', (done) => {
  const query = deleteManyFileQuery;
  query.variables.fileNames = ['example.txt', 'example2.txt'];
  query.variables.path = 'translations'

  request
    .post('/gql')
    .send(query)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err: any, res: any) => {
      if (err) return done(err);
      expect(res.body).toBeInstanceOf(Object);
      console.log(res.body.data);
      expect(res.body.data.deleteManyFiles.names).not.toBeNull();
      expect(res.body.data.deleteManyFiles.names[0]).toMatch('example.txt');
      expect(res.body.data.deleteManyFiles.names[1]).toMatch('example2.txt');
      done();
    });
});
