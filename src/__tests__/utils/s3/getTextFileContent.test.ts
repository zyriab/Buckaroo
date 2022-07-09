import {getTextFileContent} from '../../../utils/s3.utils';
import client from '../../../helpers/mockClient.help';
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

 test('Should return text file content', async () => {
  const [error, content] = await getTextFileContent({
    fileName,
    root: 'test-user-1234abcd',
    path: 'translations',
    bucketName: `${process.env.BUCKET_NAMESPACE}test-bucket-app`,
  });

  expect(error).toBeUndefined();
  expect(content).toBe('test123');
 })