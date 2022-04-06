import { RequestBody } from '../../definitions/root';
import { listBucketContent, DeleteMarker } from './listBucketContent';
import normalize from 'normalize-path';

interface InputArgs {
  req: RequestBody;
  fileNames: string[];
  root: string;
  path: string;
  addDeleteMarkersIds?: boolean;
}

export async function getManyFilesVersionsIds(
  args: InputArgs
): Promise<[undefined, [string, string[]][]] | [Error]> {
  try {
    const data: [undefined, [string, string[]][]] = [undefined, []];
    const root = normalize(args.root);
    const path = normalize(args.path);

    const [error, fileList, markers] = await listBucketContent({
      req: args.req,
      root,
      path,
      getDeleteMarkers: true,
    });

    if (error) return [error];

    for (const n of args.fileNames) {
      const versionIds = fileList!
        .filter((f) => f.name === n)
        .map((f) => f.id!);

      if (args.addDeleteMarkersIds)
        versionIds.push(
          ...(markers as DeleteMarker[])
            .filter((m) => args.fileNames.includes(m.name))
            .map((m) => m.id)
        );

      fileList!
        .filter((f) => f.name === n && f.versions)
        .map((f) => f.versions!.map((v) => v.id))
        .forEach((i) => versionIds.push(...i));

      data[1].push([n, versionIds]);
    }

    return data;
  } catch (err) {
    return [err as Error];
  }
}
