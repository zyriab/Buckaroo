/* eslint-disable no-underscore-dangle */
import resolveAuth from '../../../utils/auth/resolveAuth';
import mockReq from '../../../helpers/mockRequest.help';
import 'dotenv/config';
import { RequestBody } from '../../../definitions/root';

beforeAll(() => {
  process.env.TEST_AUTH = 'true';
});

afterAll(() => {
  process.env.TEST_AUTH = 'false';
});

test('Should resolve as authenticated', () => {
  const req = { ...mockReq } as RequestBody;
  req.body.permissions = [
    'read:bucket',
    'delete:directory',
    'create:file',
    'update:file',
    'delete:file',
  ];

  let [authed, gqlerror] = resolveAuth(req);
  expect(authed).toBe(true);
  expect(gqlerror).toBeUndefined();
  [authed, gqlerror] = resolveAuth(req, 'create:file');
  expect(authed).toBe(true);
  expect(gqlerror).toBeUndefined();
  [authed, gqlerror] = resolveAuth(req, 'delete:directory');
  expect(authed).toBe(true);
  expect(gqlerror).toBeUndefined();
  [authed, gqlerror] = resolveAuth(req, 'delete:file');
  expect(authed).toBe(true);
  expect(gqlerror).toBeUndefined();
  [authed, gqlerror] = resolveAuth(req, 'read:bucket');
  expect(authed).toBe(true);
  expect(gqlerror).toBeUndefined();
  [authed, gqlerror] = resolveAuth(req, 'update:file');
  expect(authed).toBe(true);
  expect(gqlerror).toBeUndefined();
});

test('Should resolve as NOT authenticated', () => {
  const req = { ...mockReq } as RequestBody;
  req.body.isAuth = false;

  const [authed, gqlerror] = resolveAuth(req);
  expect(authed).toBe(false);
  expect(gqlerror!.__typename).toBe('Unauthenticated');
});

test("Should resolve as NOT authenticated and __typename: 'Unauthorized'", () => {
  const req = { ...mockReq } as RequestBody;
  req.body.isAuth = true;
  req.body.permissions = [];

  let [authed, gqlerror] = resolveAuth(req, 'create:file');
  expect(authed).toBe(false);
  expect(gqlerror!.__typename).toBe('Unauthorized');
  [authed, gqlerror] = resolveAuth(req, 'delete:directory');
  expect(authed).toBe(false);
  expect(gqlerror!.__typename).toBe('Unauthorized');
  [authed, gqlerror] = resolveAuth(req, 'delete:file');
  expect(authed).toBe(false);
  expect(gqlerror!.__typename).toBe('Unauthorized');
  [authed, gqlerror] = resolveAuth(req, 'read:bucket');
  expect(authed).toBe(false);
  expect(gqlerror!.__typename).toBe('Unauthorized');
  [authed, gqlerror] = resolveAuth(req, 'update:file');
  expect(authed).toBe(false);
  expect(gqlerror!.__typename).toBe('Unauthorized');
});
