import { GetBucketVersioningCommand } from '@aws-sdk/client-s3';
import s3Client from './s3Client';

export default async function isBucketVersioned(
  bucketName: string
): Promise<[undefined, boolean] | [Error]> {
  try {
    const res = await s3Client().send(
      new GetBucketVersioningCommand({ Bucket: bucketName })
    );

    return [undefined, res.Status === 'Enabled'];
  } catch (err) {
    return [err as Error];
  }
}
