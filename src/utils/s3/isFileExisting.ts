import { HeadObjectCommand } from '@aws-sdk/client-s3';
import sanitize from 'sanitize-filename';
import normalize from 'normalize-path';
import formatPath from '../tools/formatPath.utils';
import s3Client from './s3Client';
import { RequestBody } from '../../definitions/root';

interface InputArgs {
  req: RequestBody;
  fileName: string;
  root: string;
  path: string;
  bucketName: string;
}

export default async function isFileExisting(
  args: InputArgs
): Promise<[undefined, boolean] | [Error]> {
  try {
    const fileName = sanitize(args.fileName);
    const root = normalize(args.root);
    const path = normalize(args.path);
    const fullPath = formatPath(`${root}/${path}/`, { stripTrailing: false });

    const data = await s3Client().send(
      new HeadObjectCommand({
        Bucket: args.bucketName,
        Key: `${fullPath}${fileName}`,
      })
    );

    if (
      data.$metadata.httpStatusCode === 403 ||
      data.$metadata.httpStatusCode === 404
    ) {
      return [undefined, false];
    }

    return [undefined, true];
  } catch (err) {
    return [err as Error];
  }
}
