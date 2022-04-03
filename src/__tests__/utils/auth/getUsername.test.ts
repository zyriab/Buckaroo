import { getUsername } from '../../../utils/auth/getUsername';
import fakeToken from '../../../helpers/mockToken.help';
import 'dotenv/config';

test('Should return username', () => {
  const result = getUsername(fakeToken);
  expect(result).toBe('test-user');
});
