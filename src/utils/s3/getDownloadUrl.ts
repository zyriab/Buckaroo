import { RequestBody } from '../../definitions/root';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './s3Client';
import sanitize from 'sanitize-filename';
import normalize from 'normalize-path';

interface InputArgs {
  req: RequestBody;
  fileName: string;
  path: string;
  versionId?: string;
  rootPath?: boolean;
}

export async function getDownloadUrl(
  args: InputArgs
): Promise<[undefined, string] | [Error]> {
  try {
    const client = s3Client();
    const dirName = args.rootPath
      ? ''
      : `${args.req.body.userName}-${args.req.body.userId}/`;
    const fileName = sanitize(args.fileName);
    const expirationTime = 60 * 1;

    let params = {
      Bucket: args.req.body.tenant.bucket.name,
      Key: `${dirName}${normalize(args.path)}/${fileName}`,
    };

    const res = await getSignedUrl(client, new GetObjectCommand(params), {
      expiresIn: expirationTime,
    });

    return [undefined, res];
  } catch (err: any) {
    return [err as Error];
  }
}
