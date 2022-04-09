/* eslint-disable no-console */
import { deleteManyFiles, getUploadUrl } from '../../../utils/s3.utils';
import { uploadFileToS3 } from '../../../helpers/downloadUpload.help';
import req from '../../../helpers/mockRequest.help';

const fileName = 'example.txt';
let err: any;
let url: any;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';

  [err, url] = await getUploadUrl({
    req,
    fileName,
    fileType: 'text',
    path: 'translations',
    root: 'test-user-1234abcd',
  });

  if (!err) {
    uploadFileToS3(url.url!, url.fields, './src/pseudo/', fileName);
  }
});

test('Should delete example3.txt and all its versions', async () => {
  expect(err).toBeUndefined();

  const [error, fileNames] = await deleteManyFiles({
    req,
    fileNames: [fileName],
    root: 'test-user-1234abcd',
    path: 'translations',
  });

  expect(error).toBeUndefined();
  expect(fileNames![0]).toBe(fileName);
});
