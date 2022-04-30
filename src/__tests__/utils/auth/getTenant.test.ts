import getTenant from '../../../utils/auth/getTenant';
import mockToken from '../../../helpers/mockToken.help';
import 'dotenv/config';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

test('Should return decrypted tenant', () => {
  const expectedTenant = {
    name: 'test-bucket',
    bucket: {
      isVersioned: false,
      name: `${process.env.BUCKET_NAMESPACE}test-bucket-app`,
    },
  };

  const result = getTenant(mockToken);
  expect(result).toEqual(expectedTenant);
});
