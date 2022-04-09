import checkBucketExists from '../../middlewares/checkBucketExists';
import req from '../../helpers/mockRequest.help';
import 'dotenv/config';

const res: any = { status: 200 };

beforeAll(() => {
  req.body.isAuth = true;
  req.body.tenant.bucket.exists = false;
});

test('Should confirm test bucket exists', async () => {
  await checkBucketExists(req, res, () => {});
  expect(req.body.tenant.bucket.exists).toBe(true);
});

test('Should reject because of non-existing bucket', async () => {
  req.body.tenant.bucket.name = 'non-existing-bucket';
  await checkBucketExists(req, res, () => {});
  expect(req.body.tenant.bucket.exists).toBe(false);
})

test("Should reject non-authenticated user's bucket check", async () => {
  req.body.isAuth = false;
  await checkBucketExists(req, res, () => {});
  expect(req.body.tenant.bucket.exists).toBe(false);
});