import getUserEmail from '../../../utils/auth/getUserEmail';
import fakeToken from '../../../helpers/mockToken.help';
import 'dotenv/config';

test('Should return user email', () => {
  const result = getUserEmail(fakeToken);
  expect(result).toBe('test-user@example.com');
});
