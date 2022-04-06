import { RequestBody } from '../../definitions/root';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { formatPath } from '../tools/formatPath.utils';
import { s3Client } from './s3Client';
import sanitize from 'sanitize-filename';
import normalize from 'normalize-path';

interface InputArgs {
  req: RequestBody;
  fileName: string;
  root: string;
  path: string;
}

// TODO: need to use a webhook to remove oldest version once the upload succeded (if + than n versions already exist)
export async function getUploadUrl(
  args: InputArgs
): Promise<[undefined, string] | [Error]> {
  try {
    const client = s3Client();
    const fileName = sanitize(args.fileName);
    const root = normalize(args.root);
    const path = normalize(args.path);
    const fullPath = formatPath(`${root}/${path}/`, { stripTrailing: false });
    const expirationTime = 60 * 0.5;

    let params = {
      Bucket: args.req.body.tenant.bucket.name,
      Key: `${fullPath}${fileName}`,
    };

    const url = await getSignedUrl(client, new PutObjectCommand(params), {
      expiresIn: expirationTime,
    });

    return [undefined, url];
  } catch (err: any) {
    return [err as Error];
  }
}
