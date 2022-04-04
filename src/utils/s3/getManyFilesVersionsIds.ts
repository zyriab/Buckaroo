import { RequestBody } from '../../definitions/root';
import { listBucketContent, DeleteMarker } from './listBucketContent';

interface InputArgs {
  req: RequestBody;
  fileNames: string[];
  path: string;
  addDeleteMarkersIds?: boolean;
  rootPath?: boolean;
}

export async function getManyFilesVersionsIds(
  args: InputArgs
): Promise<[undefined, [string, string[]][]] | [Error]> {
  const data: [undefined, [string, string[]][]] = [undefined, []];

  const [error, fileList, markers] = await listBucketContent({
    req: args.req,
    path: args.path,
    getDeleteMarkers: true,
    showRoot: args.rootPath,
  });

  if (error) return [error];

  for (const n of args.fileNames) {
    const versionIds = fileList!.filter((f) => f.name === n).map((f) => f.id!);

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
}
