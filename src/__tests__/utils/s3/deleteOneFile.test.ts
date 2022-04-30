import { deleteOneFile } from '../../../utils/s3.utils';
import client from '../../../helpers/mockClient.help';
import req from '../../../helpers/mockRequest.help';
import 'dotenv/config';

const fileName = 'example.txt';
const s3MockClient = client();

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
});

beforeEach(() => {
  s3MockClient.client.reset();
  s3MockClient.setup();
});

test('Should delete example.txt and all its versions', async () => {
  const [error, file] = await deleteOneFile({
    req,
    fileName,
    root: 'test-user-1234abcd',
    path: 'translations',
    bucketName: `${process.env.BUCKET_NAMESPACE}test-bucket-app`,
  });

  expect(error).toBeUndefined();
  expect(file).toBe(fileName);
});
