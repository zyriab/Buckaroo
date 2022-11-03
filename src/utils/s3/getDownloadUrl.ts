import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sanitize from 'sanitize-filename';
import normalize from 'normalize-path';
import s3Client from './s3Client';

interface GetDownloadUrlArgs {
  fileName: string;
  root: string;
  path: string;
  bucketName: string;
  versionId?: string; // TODO: see about downloading given version?
}

export default async function getDownloadUrl(
  args: GetDownloadUrlArgs
): Promise<[undefined, string] | [Error]> {
  try {
    const client = s3Client();
    const root = normalize(args.root);
    const fileName = sanitize(args.fileName);
    const expirationTime = 60 * 1;

    const params = {
      Bucket: args.bucketName,
      Key: `${root}/${normalize(args.path)}/${fileName}`,
    };

    const res = await getSignedUrl(client, new GetObjectCommand(params), {
      expiresIn: expirationTime,
    });

    return [undefined, res];
  } catch (err: any) {
    return [err as Error];
  }
}
