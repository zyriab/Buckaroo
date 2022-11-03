import { RequestBody, ResponseBody } from '../definitions/root';

export default function setTestingData(
  req: RequestBody,
  res: ResponseBody<any>,
  next: () => void
) {
  const tenant = {
    name: 'test-bucket',
    bucket: {
      exists: true,
      isVersioned: true,
      name: `${process.env.BUCKET_NAMESPACE}test-bucket-app`,
    },
  };

  req.body.isAuth = true;
  req.body.tenant = tenant;
  req.body.username = 'test-user';
  req.body.userEmail = 'test-user@example.com';
  req.body.userId = '1234abcd';
  req.body.permissions = [];
  
  if (process.env.TEST_AUTH === 'true')
    req.body.permissions = [
      'read:bucket',
      'delete:directory',
      'create:file',
      'update:file',
      'delete:file',
    ];

  next();
}
