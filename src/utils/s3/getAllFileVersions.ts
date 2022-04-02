import { RequestBody } from '../../definitions/root';
import { listBucketContent, MarkerData } from './listBucketContent';

interface InputArgs {
  req: RequestBody;
  fileName: string;
  path: string;
  root?: boolean;
}

export async function getAllFileVersions(
  args: InputArgs
): Promise<[undefined, string[]] | [Error]> {
  const [error, fileList, markers] = await listBucketContent({
    req: args.req,
    path: args.path,
    getMarkersIds: true,
    showRoot: args.root,
  });

  if (error) return [error];

  const versionIds = fileList!
    .filter((f) => f.name === args.fileName)
    .map((f) => f.id!);

  if (markers)
    versionIds.push(
      ...(markers as MarkerData[])
        .filter((m) => m.name === args.fileName)
        .map((m) => m.id)
    );

  fileList!
    .filter((f) => f.name === args.fileName && f.versions)
    .map((f) => f.versions!.map((v) => v.id))
    .forEach((i) => versionIds.push(...i));

  return [undefined, versionIds];
}
