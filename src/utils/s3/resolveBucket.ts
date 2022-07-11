import { GqlError } from '../../definitions/types';
import isBucketExisting from './isBucketExisting';

export default async function resolveBucket(
  bucketName: string
): Promise<
  [boolean, undefined] | [boolean, GqlError]
> {
  const [storageError, exists] = await isBucketExisting(bucketName);

  if (storageError) throw storageError;

  if (!exists) {
    return [
      false,
      {
        __typename: 'StorageNotFound',
        message: 'The requested bucket could not be found',
      },
    ];
  }
  return [true, undefined];
}
