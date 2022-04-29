import { deleteOneFile, getUploadUrl } from '../../../utils/s3.utils';
import req from '../../../helpers/mockRequest.help';
import { uploadFileToS3 } from '../../../helpers/downloadUpload.help';

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
    bucketName: `${process.env.BUCKET_NAMESPACE}test-bucket-app`,
  });

  if (!err) {
    uploadFileToS3(url.url!, url.fields, './src/pseudo/', fileName);
  }
});

test('Should delete example3.txt and all its versions', async () => {
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
