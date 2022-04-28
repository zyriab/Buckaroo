/* eslint-disable no-underscore-dangle */
import resolveAuth from '../../../utils/auth/resolveAuth';
import req from '../../../helpers/mockRequest.help';
import 'dotenv/config';

beforeAll(() => {
  process.env.TEST_AUTH = 'true';
});

afterAll(() => {
  process.env.TEST_AUTH = 'false';
});

test('Should resolve as authenticated', () => {
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
  req.body.isAuth = false;

  const [authed, gqlerror] = resolveAuth(req);
  expect(authed).toBe(false);
  expect(gqlerror!.__typename).toBe('Unauthenticated');
});

test("Should resolve as NOT authenticated and __typename: 'Unauthorized'", () => {
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

test("Should resolve as NOT authenticated and __typename: 'StorageNotFound'", () => {
  const [authed, gqlerror] = resolveAuth(req);
  expect(authed).toBe(false);
  expect(gqlerror!.__typename).toBe('StorageNotFound');
});
