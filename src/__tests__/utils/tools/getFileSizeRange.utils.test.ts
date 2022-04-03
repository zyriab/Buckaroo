import { getFileSizeRange } from '../../../utils/tools/getFileSizeRange.utils';

test('Should return a range with 10MiB', () => {
  const result = getFileSizeRange('image');
  expect(result).toEqual(['content-length-range', 0, 1048576 * 10]);
});

test('Should return a range with 5MiB', () => {
  const result = getFileSizeRange('text');
  expect(result).toEqual(['content-length-range', 0, 1048576 * 5]);
});

test('Should return a range with 1MiB', () => {
  const result = getFileSizeRange();
  expect(result).toEqual(['content-length-range', 0, 1048576]);
});
