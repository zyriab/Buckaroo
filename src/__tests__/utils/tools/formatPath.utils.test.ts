import { formatPath } from '../../../utils/tools/formatPath.utils';

test("Should return a path without leading and trailing '/'", () => {
  const result = formatPath('/test/folder/');
  expect(result).toBe('test/folder');
});

test("Should return a path without trailing '/'", () => {
  const result = formatPath('/test/folder/', { stripLeading: false });
  expect(result).toBe('/test/folder');
});

test("Should return a path without leading '/'", () => {
  const result = formatPath('/test/folder/', { stripTrailing: false });
  expect(result).toBe('test/folder/');
});

test("Should return a path without leading '/' and only one '/'", () => {
  let result = formatPath('/test/folder//', { stripTrailing: false });
  expect(result).toBe('test/folder/');

  result = formatPath('//test/folder//', { stripTrailing: false });
  expect(result).toBe('test/folder/');
});

test("Should return an empty string", () => {
  const result = formatPath('///', { stripTrailing: false });
  expect(result).toBe('');
});