import { RequestBody } from '../../definitions/root';
import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { s3Client } from './s3Client';
import { getAllFileVersions } from './getAllFileVersions';
import sanitize from 'sanitize-filename';
import normalize from 'normalize-path';

interface InputArgs {
  req: RequestBody;
  fileName: string;
  path: string;
  versionId?: string;
  rootPath?: boolean;
}

export async function deleteOneFile(
  args: InputArgs
): Promise<[undefined, string] | [Error]> {
  try {
    if (args.versionId && typeof args.versionId !== 'string')
      throw new Error('VersionId needs to be a string.');

    let res: DeleteObjectCommandOutput | undefined;
    const fileName = sanitize(args.fileName);
    const path = normalize(args.path);
    const dirName = args.rootPath
      ? ''
      : `${args.req.body.username}-${args.req.body.userId}/`;
    const params = {
      Bucket: args.req.body.tenant.bucket.name,
      Key: path ? `${dirName}${path}/${fileName}` : `${dirName}${fileName}`,
      VersionId: args.versionId,
    };

    if (args.versionId)
      res = await s3Client().send(new DeleteObjectCommand(params));
    else {
      const [error, versionIds] = await getAllFileVersions({
        req: args.req,
        fileName,
        path,
        rootPath: args.rootPath,
      });

      if (error) return [error];

      for (const id of versionIds!) {
        params.VersionId = id;
        res = await s3Client().send(new DeleteObjectCommand(params));
      }
    }

    const status = res ? res.$metadata.httpStatusCode : 500;

    if (status && status >= 200 && status <= 299) return [undefined, fileName];

    throw new Error(
      `Could not finish deletion: ${status}. Some object may have been deleted.`
    );
  } catch (err: any) {
    return [err as Error];
  }
}
