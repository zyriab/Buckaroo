import { deleteOneFile } from '../../../utils/s3.utils';
import req from '../../../helpers/mockRequest.help';

test('Should delete example3.txt and all its versions', async () => {
  const [error, fileName] = await deleteOneFile({
    req,
    fileName: 'example3.txt',
    root: 'test-user-1234abcd',
    path: 'translations',
  });

  expect(error).toBeUndefined();
  expect(fileName).toBe('example3.txt');
});
