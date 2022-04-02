import { RequestBody } from '../definitions/root';
import 'dotenv/config'

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

const tenant = {
  name: 'test-bucket',
  bucket: {
    exists: true,
    name: `${process.env.BUCKET_NAMESPACE}-test-bucket-app`,
  },
};

//@ts-ignore
const req: RequestBody = {
  body: {
    token: tkn,
    isAuth: true,
    userId: '1234abcd',
    userName: 'test-user',
    userEmail: 'test-user@example.com',
    permissions: ['read:bucket'],
    tenant: tenant
  },
};

export default req;
