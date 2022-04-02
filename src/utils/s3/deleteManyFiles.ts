import { RequestBody } from '../../definitions/root';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getAllFileVersions } from './getAllFileVersions';
import { s3Client } from './s3Client';
import sanitize from 'sanitize-filename';
import normalize from 'normalize-path';

interface InputArgs {
  req: RequestBody;
  fileNames: string[];
  path: string;
  root?: boolean;
}

export async function deleteManyFiles(
  args: InputArgs
): Promise<[undefined, string[]] | [Error]> {
  try {
    const path = normalize(args.path);
    const fileNames = args.fileNames.map((n) => sanitize(n));
    const dirName = args.root
      ? ''
      : `${args.req.body.userName}-${args.req.body.userId}/`;

    const params = {
      Bucket: args.req.body.tenant.bucket.name,
      Delete: {
        Objects: [] as any,
      },
    };

    for (const n of args.fileNames) {
      const [error, versionIds] = await getAllFileVersions({
        req: args.req,
        fileName: n,
        path: path,
        root: args.root,
      });

      if (error) throw error;

      for (const i of versionIds!) {
        params.Delete.Objects.push({
          Key: `${dirName}${path}/${n}`,
          VersionId: i,
        });
      }
    }

    const res = await s3Client().send(new DeleteObjectsCommand(params));
    const status = res.$metadata.httpStatusCode;
    if (status && status >= 200 && status <= 299) return [undefined, fileNames];

    throw new Error(`Error while deleting objects: ${status} - ${res.Errors}.`);
  } catch (err: any) {
    return [err as Error];
  }
}