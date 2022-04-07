import getUserId from '../../../utils/auth/getUserId';
import fakeToken from '../../../helpers/mockToken.help';
import 'dotenv/config';

test('Should return user ID', () => {
  const result = getUserId(fakeToken);
  expect(result).toBe('1234abcd');
});
