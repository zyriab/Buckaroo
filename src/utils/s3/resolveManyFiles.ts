import { RequestBody } from '../../definitions/root';
import { GqlError } from '../../definitions/types';
import isFileExisting from './isFileExisting';

interface InputArgs {
  req: RequestBody;
  fileNames: string[];
  root: string;
  path: string;
  bucketName: string;
}

export default async function resolveManyFiles(
  args: InputArgs
): Promise<[boolean, undefined] | [boolean, GqlError]> {
  const checkedFiles = await Promise.all(
    args.fileNames.map((fileName) =>
      isFileExisting({
        fileName,
        root: args.root,
        path: args.path,
        bucketName: args.bucketName,
      })
    )
  );

  if (checkedFiles.filter(([e]) => e !== undefined).length > 0) {
    for (const [e] of checkedFiles) {
      if (e) throw e;
    }
  }

  if (checkedFiles.filter(([, exists]) => !exists).length > 0) {
    const index = checkedFiles.indexOf(
      checkedFiles.filter(([, exists]) => !exists)[0]
    );

    return [
      false,
      {
        __typename: 'FileNotFound',
        message: `The requested file: "${args.fileNames[index]}" could not be found`,
      },
    ];
  }

  return [true, undefined];
}
