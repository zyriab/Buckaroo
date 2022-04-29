import isBucketExisting from '../../../utils/s3/isBucketExisting';
import 'dotenv/config';

const bucketName = `${process.env.BUCKET_NAMESPACE}test-bucket-app`;
beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

test('Should check for bucket existence and return true', async () => {
  const res = await isBucketExisting(bucketName);
  expect(res[0]).toBeUndefined();
  expect(res[1]).toBeTruthy();
});

test('Should check for bucket existence and return false', async () => {
  const res = await isBucketExisting('non-existing');
  expect(res[0]).toBeUndefined();
  expect(res[1]).toBeFalsy();
});
