import hasPermission from '../../../utils/auth/hasPermission';
import req from '../../../helpers/mockRequest.help';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

test('Should return true on given permission', () => {
  req.body.permissions = ['create:file'];
  const result = hasPermission(req, 'create:file');
  expect(result).toBe(true);
});

test('Should return false on given permission', () => {
  req.body.permissions = [];

  const result = hasPermission(req, 'create:file');
  expect(result).toBe(false);
});
