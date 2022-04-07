import getTenant from '../../../utils/auth/getTenant';
import fakeToken from '../../../helpers/mockToken.help';
import 'dotenv/config';

test('Should return decrypted tenant', () => {
  const expectedTenant = {
    name: 'test-bucket',
    bucket: {
      exists: false,
      isVersioned: false,
      name: `${process.env.BUCKET_NAMESPACE}test-bucket-app`,
    },
  };

  const result = getTenant(fakeToken);
  expect(result).toEqual(expectedTenant);
});
