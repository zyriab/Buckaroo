import { DecodedToken } from '../../../definitions/auth';
import getAppMetadata from '../../../utils/auth/getAppMetadata';
import mockToken from '../../../helpers/mockToken.help';
import 'dotenv/config';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

test('Should return App metadata', () => {
  const token: DecodedToken = { ...mockToken };
  const result = getAppMetadata(token);
  expect(result).toEqual({ tenant: process.env.ENCRYPTED_TEST_TENANT });
});
