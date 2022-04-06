import { RequestBody } from '../../definitions/root';
import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { s3Client } from './s3Client';
import { getOneFileVersionsIds } from './getOneFileVersionsIds';
import { formatPath } from '../tools/formatPath.utils';
import sanitize from 'sanitize-filename';
import normalize from 'normalize-path';

interface InputArgs {
  req: RequestBody;
  fileName: string;
  root: string;
  path: string;
  versionId?: string;
}

export async function deleteOneFile(
  args: InputArgs
): Promise<[undefined, string] | [Error]> {
  try {
    let res: DeleteObjectCommandOutput | undefined;
    const fileName = sanitize(args.fileName);
    const root = normalize(args.root);
    const path = normalize(args.path);
    const fullPath = formatPath(`${root}/${path}/`, { stripTrailing: false });
    const params = {
      Bucket: args.req.body.tenant.bucket.name,
      Key: `${fullPath}${fileName}`,
      VersionId: args.versionId,
    };

    if (args.versionId)
      res = await s3Client().send(new DeleteObjectCommand(params));
    else {
      const [error, versionIds] = await getOneFileVersionsIds({
        req: args.req,
        fileName,
        path,
        addDeleteMarkersIds: true,
        root,
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
      `Could not finish deletion: ${status}. Some objects may have been deleted.`
    );
  } catch (err) {
    return [err as Error];
  }
}
