import { RequestBody } from '../../definitions/root';
import deleteOneFile from './deleteOneFile';
import listBucketContent from './listBucketContent';

interface InputArgs {
  req: RequestBody;
  bucketName: string;
  root: string;
  fileName: string;
  maxVersionsNumber: number;
}

export default async function controlVersions(
  args: InputArgs
): Promise<[undefined, boolean] | [Error, boolean] | [Error]> {
  try {
    const [error, files] = await listBucketContent({
      req: args.req,
      root: args.root,
      bucketName: args.bucketName,
    });

    if (error) throw error;

    const fileToUpdate = files.find((f) => f.name === args.fileName);

    if (
      fileToUpdate === undefined ||
      fileToUpdate.versions!.length <= args.maxVersionsNumber
    ) {
      return [undefined, false];
    }

    const filesToDelete = await Promise.all(
      fileToUpdate
        .versions!.sort(
          (a, b) =>
            new Date(a.lastModified).getTime() -
            new Date(b.lastModified).getTime()
        )
        .slice(args.maxVersionsNumber)
        .map((v) =>
          deleteOneFile({
            req: args.req,
            fileName: args.fileName,
            root: args.root,
            path: fileToUpdate.path.replace(args.root, ''),
            versionId: v.id,
            bucketName: args.bucketName,
          })
        )
    );

    return [<Error | undefined>filesToDelete.find(([e]) => e !== undefined)?.at(0), true];
  } catch (err) {
    return [err as Error];
  }
}
