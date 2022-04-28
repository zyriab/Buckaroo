import { RequestBody } from '../../definitions/root';
import deleteOneFile from './deleteOneFile';
import listBucketContent from './listBucketContent';

interface InputArgs {
  req: RequestBody;
  bucketName: string;
  root: string;
  fileName: string;
  maxNumberOfVersions: number;
}

export default async function controlVersions(
  args: InputArgs
): Promise<[undefined, boolean] | [Error]> {
  try {
    const [error, files] = await listBucketContent({
      req: args.req,
      root: args.root,
      bucketName: args.bucketName,
    });

    if (error) throw error;

    const fileToUpdate = files.filter((f) => f.name === args.fileName);

    if (
      fileToUpdate.length === 0 ||
      fileToUpdate[0].versions!.length < args.maxNumberOfVersions
    ) {
      return [undefined, false];
    }

    const [fail] = await deleteOneFile({
      req: args.req,
      fileName: args.fileName,
      root: args.root,
      path: fileToUpdate[0].path,
      versionId:
        fileToUpdate[0].versions![fileToUpdate[0].versions!.length - 1].id,
      bucketName: args.bucketName,
    });

    if (fail) throw fail;

    return [undefined, true];
  } catch (err) {
    return [err as Error];
  }
}
