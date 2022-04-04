import { RequestBody } from '../../definitions/root';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getManyFilesVersionsIds } from './getManyFilesVersionsIds';
import { s3Client } from './s3Client';
import sanitize from 'sanitize-filename';
import normalize from 'normalize-path';

interface InputArgs {
  req: RequestBody;
  fileNames: string[];
  path: string;
  versionIds?: string[];
  rootPath?: boolean;
}

export async function deleteManyFiles(
  args: InputArgs
): Promise<[undefined, string[]] | [Error]> {
  try {
    const path = normalize(args.path);
    const fileNames = args.fileNames.map((n) => sanitize(n));
    const dirName = args.rootPath
      ? ''
      : `${args.req.body.username}-${args.req.body.userId}/`;

    const params = {
      Bucket: args.req.body.tenant.bucket.name,
      Delete: {
        Objects: [] as any,
      },
    };

    let versionIdsMap: [string, string[]][] | undefined,
      error: Error | undefined;
    if (args.req.body.tenant.bucket.isVersioned && !args.versionIds) {
      [error, versionIdsMap] = await getManyFilesVersionsIds({
        req: args.req,
        fileNames,
        path,
        addDeleteMarkersIds: true,
        rootPath: args.rootPath,
      });

      if (error) throw error;

      for (const map of versionIdsMap!) {
        for (const i of map[1])
          params.Delete.Objects.push({
            Key: `${dirName}${path}/${map[0]}`,
            VersionId: i,
          });
      }
    } else if (args.req.body.tenant.bucket.isVersioned && args.versionIds) {
      for (const n of args.fileNames)
        for (const i of args.versionIds!) {
          params.Delete.Objects.push({
            Key: `${dirName}${path}/${n}`,
            VersionId: i,
          });
        }
    } else {
      for (const n of args.fileNames)
        params.Delete.Objects.push({
          Key: `${dirName}${path}/${n}`,
        });
    }

    const res = await s3Client().send(new DeleteObjectsCommand(params));
    const status = res.$metadata.httpStatusCode;
    if (status && status >= 200 && status <= 299) return [undefined, fileNames];

    throw new Error(`Error while deleting objects: ${status} - ${res.Errors}.`);
  } catch (err: any) {
    return [err as Error];
  }
}
