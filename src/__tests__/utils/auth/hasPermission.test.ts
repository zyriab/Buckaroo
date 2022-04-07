import hasPermission from '../../../utils/auth/hasPermission';
import fakeReq from '../../../helpers/mockRequest.help';

test('Should return true on given permission', () => {
  const req = fakeReq;
  req.body.permissions = ['create:file'];
  const result = hasPermission(fakeReq, 'create:file');
  expect(result).toBe(true);
});

test('Should return false on given permission', () => {
  const req = { ...fakeReq };
  req.body.permissions = [];

  const result = hasPermission(fakeReq, 'create:file');
  expect(result).toBe(false);
});
