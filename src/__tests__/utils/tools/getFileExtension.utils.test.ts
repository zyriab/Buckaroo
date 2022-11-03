import getFileExtension from '../../../utils/tools/getFileExtension.utils';

test('Should return file extension', () => {
  let result = getFileExtension('example.txt');
  expect(result).toBe('txt');
  result = getFileExtension('example.some.txt');
  expect(result).toBe('txt');
});

test('Should return an empty stirng', () => {
  let result = getFileExtension('folder/');
  expect(result).toBe('');
  result = getFileExtension('folder.name/');
  expect(result).toBe('');
  result = getFileExtension('folder');
  expect(result).toBe('');
});
