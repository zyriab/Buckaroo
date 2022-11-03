import { getTextFileContent } from '../../../utils/s3.utils';
import client from '../../../helpers/mockClient.help';
import 'dotenv/config';

const fileName = 'example.txt';
const root = 'test-user-1234abcd';
const path = 'translations';
const versionId = 'abcd';
const bucketName = `${process.env.BUCKET_NAMESPACE}test-bucket-app`;
const s3MockClient = client();

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
});

beforeEach(() => {
  s3MockClient.client.reset();
  s3MockClient.setup();
});

test('Should return latest text file content', async () => {
  const [error, content] = await getTextFileContent({
    fileName,
    root,
    path,
    bucketName,
  });

  expect(error).toBeUndefined();
  expect(content).toBe('Latest');
});

test('Should return older text file content', async () => {
  const [error, content] = await getTextFileContent({
    fileName,
    root,
    path,
    bucketName,
    versionId,
  });

  expect(error).toBeUndefined();
  expect(content).toBe('Older');
});

test('Should return an error (file not found)', async () => {
  const [error, content] = await getTextFileContent({
    fileName,
    root,
    path: 'somewhere-else/',
    bucketName,
  });

  expect(content).toBeUndefined();
  expect(error).not.toBeUndefined();
});

test('Should return an error (wrong file type)', async () => {
  const [error, content] = await getTextFileContent({
    fileName: 'test.png',
    root,
    path,
    bucketName,
  });

  expect(content).toBeUndefined();
  expect(error).not.toBeUndefined();
  expect(error?.message).toContain('is not of type "text/*"');
});
