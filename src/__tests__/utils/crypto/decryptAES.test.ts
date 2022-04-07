import decryptAES from '../../../utils/crypto/decryptAES';
import 'dotenv/config';

test('Should decrypt ENCRYPTED_TEST_TENANT to test-user', () => {
  const result = decryptAES(process.env.ENCRYPTED_TEST_TENANT!);
  expect(result).toBe('test-bucket');
});
