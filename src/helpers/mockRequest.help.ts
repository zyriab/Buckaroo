import { RequestBody } from '../definitions/root';
import 'dotenv/config';

const tkn = {
  aud: [],
  azp: '',
  exp: 9999,
  iat: 9999,
  iss: '',
  permissions: [],
  scope: '',
  sub: 'auth0|1234abcd',
};

let permissions: any = [];

if (process.env.TEST_AUTH === 'true')
  permissions = [
    'read:bucket',
    'delete:directory',
    'create:file',
    'update:file',
    'delete:file',
  ];

const tenant = {
  name: 'test-bucket',
  bucket: {
    exists: true,
    isVersioned: true,
    name: `${process.env.BUCKET_NAMESPACE}test-bucket-app`,
  },
};

// @ts-ignore
const req: RequestBody = {
  body: {
    token: tkn,
    isAuth: true,
    userId: '1234abcd',
    username: 'test-user',
    userEmail: 'test-user@example.com',
    permissions,
    tenant,
  },
};

export default req;
