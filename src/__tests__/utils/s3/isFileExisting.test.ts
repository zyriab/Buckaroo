/* eslint-disable no-console */
import req from '../../../helpers/mockRequest.help';
import { uploadFileToS3 } from '../../../helpers/downloadUpload.help';
import {
  deleteOneFile,
  getUploadUrl,
  isFileExisting,
} from '../../../utils/s3.utils';

let err: any;
let url: any;
const fileName = 'example.txt';
const params = {
  req,
  fileName,
  root: 'test-user-1234abcd',
  path: 'translations',
  bucketName: `${process.env.BUCKET_NAMESPACE}test-bucket-app`,
};

async function uploadFile() {
  [err, url] = await getUploadUrl({ fileType: 'text', ...params });

  if (!err) {
    uploadFileToS3(url.url!, url.fields, './src/pseudo/', fileName);
  }
}

async function deleteFile() {
  const [error] = await deleteOneFile(params);

  if (error) {
    console.error(error);
  }
}

test('Should check if file exists and return true', async () => {
  await uploadFile();
  expect(err).toBeUndefined();

  const response = await isFileExisting(params);
  expect(response[0]).toBeUndefined();
  expect(response[1]).toBeTruthy();

  await deleteFile();
  expect(err).toBeUndefined();
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
