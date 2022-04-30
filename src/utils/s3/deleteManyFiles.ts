import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import sanitize from 'sanitize-filename';
import normalize from 'normalize-path';
import getManyFilesVersionsIds from './getManyFilesVersionsIds';
import formatPath from '../tools/formatPath.utils';
import s3Client from './s3Client';
import { RequestBody } from '../../definitions/root';

interface InputArgs {
  req: RequestBody;
  fileNames: string[];
  root: string;
  path: string;
  bucketName: string;
  versionIds?: string[];
}

export default async function deleteManyFiles(
  args: InputArgs
): Promise<[undefined, string[]] | [Error]> {
  try {
    const root = normalize(args.root);
    const path = normalize(args.path);
    const fileNames = args.fileNames.map((n) => sanitize(n));
    const fullPath = formatPath(`${root}/${path}/`, { stripTrailing: false });

    const params = {
      Bucket: args.bucketName,
      Delete: {
        Objects: [] as any,
      },
    };

    let versionIdsMap: [string, string[]][] | undefined;
    let error: Error | undefined;

    if (args.req.body.tenant.bucket.isVersioned && !args.versionIds) {
      [error, versionIdsMap] = await getManyFilesVersionsIds({
        req: args.req,
        fileNames,
        root,
        path,
        addDeleteMarkersIds: true,
        bucketName: args.bucketName,
      });

      if (error) throw error;

      for (const map of versionIdsMap!) {
        for (const i of map[1])
          params.Delete.Objects.push({
            Key: `${fullPath}${map[0]}`,
            VersionId: i,
          });
      }
    } else if (args.req.body.tenant.bucket.isVersioned && args.versionIds) {
      for (const n of args.fileNames)
        for (const i of args.versionIds!) {
          params.Delete.Objects.push({
            Key: `${fullPath}${n}`,
            VersionId: i,
          });
        }
    } else {
      for (const n of args.fileNames)
        params.Delete.Objects.push({
          Key: `${fullPath}${n}`,
        });
    }

    const res = await s3Client().send(new DeleteObjectsCommand(params));

    const status = res?.$metadata.httpStatusCode || 500;

    if (status >= 200 && status <= 299) {
      return [undefined, fileNames];
    }

    throw new Error(`Error while deleting objects: ${status} - ${res.Errors}.`);
  } catch (err: any) {
    return [err as Error];
  }
}
