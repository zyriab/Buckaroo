import { GqlError } from '../../definitions/types';
import isFileExisting from './isFileExisting';

interface ResolveOneFileArgs {
  fileName: string;
  root: string;
  path: string;
  bucketName: string;
}

export default async function resolveOneFile(
  args: ResolveOneFileArgs
): Promise<[boolean, undefined] | [boolean, GqlError]> {
  const [fErr, fExists] = await isFileExisting(args);

  if (fErr) throw fErr;

  if (!fExists) {
    return [
      false,
      {
        __typename: 'FileNotFound',
        message: 'The requested file could not be found',
      },
    ];
  }

  return [true, undefined];
}
