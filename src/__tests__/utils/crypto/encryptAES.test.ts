import { encryptAES } from '../../../utils/crypto/encryptAES';
import 'dotenv/config';

test('Should encrypt test-user to ENCRYPTED_TEST_TENANT', () => {
  const result = encryptAES('test-user');
  expect((<string>result).slice(0, 'test-user'.length)).toBe(
    (<string>process.env.ENCRYPTED_TEST_TENANT).slice(0, 'test-user'.length)
  );
});
