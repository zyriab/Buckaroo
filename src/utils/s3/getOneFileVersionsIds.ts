import normalize from 'normalize-path';
import listBucketContent from './listBucketContent';
import { RequestBody } from '../../definitions/root';
import { DeleteMarker } from '../../definitions/s3';

interface InputArgs {
  req: RequestBody;
  fileName: string;
  root: string;
  path: string;
  bucketName: string;
  addDeleteMarkersIds?: boolean;
}

export default async function getOneFileVersionsIds(
  args: InputArgs
): Promise<[undefined, string[]] | [Error]> {
  try {
    const root = normalize(args.root);
    const path = normalize(args.path);

    const [error, files, markers] = await listBucketContent({
      req: args.req,
      root,
      path,
      getDeleteMarkers: true,
      bucketName: args.bucketName,
    });

    if (error) return [error];

    const versionIds = files!
      .filter((f) => f.name === args.fileName)
      .map((f) => f.id!);

    if (args.addDeleteMarkersIds) {
      versionIds.push(
        ...(markers as DeleteMarker[])
          .filter((m) => m.name === args.fileName)
          .map((m) => m.id)
      );
    }

    files!
      .filter((f) => f.name === args.fileName && f.versions)
      .map((f) => f.versions!.map((v) => v.id))
      .forEach((i) => versionIds.push(...i));

    return [undefined, versionIds];
  } catch (err) {
    return [err as Error];
  }
}
