import { controlVersions } from '../../../utils/s3.utils';
import client from '../../../helpers/mockClient.help';
import req from '../../../helpers/mockRequest.help';
import 'dotenv/config';

const s3MockClient = client();

const params = {
  req,
  bucketName: `${process.env.BUCKET_NAMESPACE}test-bucket-app`,
  root: 'test-user-1234abcd',
  fileName: 'example.txt',
};

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

beforeEach(() => {
  s3MockClient.client.reset();
  s3MockClient.setup();
});

test('Should check for versions and remove 1 file', async () => {
  const [error, done] = await controlVersions({
    ...params,
    maxVersionsNumber: 2,
  });

  expect(error).toBeUndefined();
  expect(done).toBeTruthy();
});

test('Should check for versions and remove no file', async () => {
  const [error, done] = await controlVersions({
    ...params,
    maxVersionsNumber: 99,
  });

  expect(error).toBeUndefined();
  expect(done).toBeFalsy();
});
