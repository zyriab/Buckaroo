import { File } from '../../definitions/generated/graphql';
import { RequestBody } from '../../definitions/root';
import { listBucketContent, DeleteMarker } from './listBucketContent';
import normalize from 'normalize-path';

interface InputArgs {
  req: RequestBody;
  fileName: string;
  root: string;
  path: string;
  addDeleteMarkersIds?: boolean;
}

export async function getOneFileVersionsIds(
  args: InputArgs
): Promise<[undefined, string[]] | [Error]> {
  try {
    const root = normalize(args.root);
    const path = normalize(args.path);

    const [error, fileList, markers] = await listBucketContent({
      req: args.req,
      root,
      path,
      getDeleteMarkers: true,
    });

    if (error) return [error];

    const versionIds = fileList!
      .filter((f) => f.name === args.fileName)
      .map((f) => f.id!);

    if (args.addDeleteMarkersIds)
      versionIds.push(
        ...(markers as DeleteMarker[])
          .filter((m) => m.name === args.fileName)
          .map((m) => m.id)
      );

    fileList!
      .filter((f) => f.name === args.fileName && f.versions)
      .map((f) => f.versions!.map((v) => v.id))
      .forEach((i) => versionIds.push(...i));

    return [undefined, versionIds];
  } catch (err) {
    return [err as Error];
  }
}
