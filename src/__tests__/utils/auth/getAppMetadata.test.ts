import { DecodedToken } from '../../../definitions/auth';
import getAppMetadata from '../../../utils/auth/getAppMetadata';
import fakeToken from '../../../helpers/mockToken.help';
import 'dotenv/config';

test('Should return App metadata', () => {
  const token: DecodedToken = { ...fakeToken };
  const result = getAppMetadata(token);
  expect(result).toEqual({ tenant: process.env.ENCRYPTED_TEST_TENANT });
});
