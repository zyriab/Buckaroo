import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
} from '@aws-sdk/client-s3';
import sanitize from 'sanitize-filename';
import normalize from 'normalize-path';
import s3Client from './s3Client';
import formatPath from '../tools/formatPath.utils';
import deleteManyFiles from './deleteManyFiles';
import { RequestBody } from '../../definitions/root';

interface InputArgs {
  req: RequestBody;
  fileName: string;
  root: string;
  path: string;
  bucketName: string;
  versionId?: string;
}

export default async function deleteOneFile(
  args: InputArgs
): Promise<[undefined, string] | [Error]> {
  try {
    let res: DeleteObjectCommandOutput | undefined;
    const fileName = sanitize(args.fileName);
    const root = normalize(args.root);
    const path = normalize(args.path);
    const fullPath = formatPath(`${root}/${path}/`, { stripTrailing: false });
    const { isVersioned } = args.req.body.tenant.bucket;

    const params: any = {
      Bucket: args.bucketName,
      Key: `${fullPath}${fileName}`,
      VersionId: isVersioned ? args.versionId : 'null',
    };

    if (!isVersioned) {
      res = await s3Client().send(new DeleteObjectCommand(params));
    } else if (isVersioned && args.versionId) {
      res = await s3Client().send(new DeleteObjectCommand(params));
    } else {
      const [error] = await deleteManyFiles({
        req: args.req,
        fileNames: [args.fileName],
        root: args.root,
        path: args.path,
        bucketName: args.bucketName,
      });

      if (error) return [error];

      return [undefined, fileName];
    }

    const status = res?.$metadata.httpStatusCode || 500;

    if (status >= 200 && status <= 299) {
      return [undefined, fileName];
    }

    throw new Error(
      `Could not finish deletion: ${status}. Some objects may have been deleted.`
    );
  } catch (err) {
    return [err as Error];
  }
}
