import { RequestBody } from '../../definitions/root';
import isFileExisting from './isFileExisting';

interface InputArgs {
  req: RequestBody;
  fileName: string;
  root: string;
  path: string;
  bucketName: string;
}

export default async function resolveFile(args: InputArgs) {
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
