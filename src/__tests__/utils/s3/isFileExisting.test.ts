/* eslint-disable no-console */
import client from '../../../helpers/mockClient.help';
import { isFileExisting } from '../../../utils/s3.utils';
import 'dotenv/config';

const s3MockClient = client();
const fileName = 'example.txt';
const params = {
  fileName,
  root: 'test-user-1234abcd',
  path: 'translations',
  bucketName: `${process.env.BUCKET_NAMESPACE}test-bucket-app`,
};

beforeEach(() => {
  s3MockClient.client.reset();
  s3MockClient.setup();
});

test('Should check if file exists and return true', async () => {
  const response = await isFileExisting(params);
  expect(response[0]).toBeUndefined();
  expect(response[1]).toBeTruthy();
});

test('Should check if file exists and return false', async () => {
  const response = await isFileExisting({
    ...params,
    fileName: 'nonexistingfile.txt',
  });
  expect(response[0]).toBeUndefined();
  expect(response[1]).toBeFalsy();
});

test('Should check if directory exists and return true', async () => {
  const response = await isFileExisting({
    ...params,
    fileName: '',
    path: 'translations',
  });
  expect(response[0]).toBeUndefined();
  expect(response[1]).toBeTruthy();
});
