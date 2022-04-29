import { HeadBucketCommand } from '@aws-sdk/client-s3';
import s3Client from './s3Client';

export default async function isBucketExisting(
  bucketName: string
): Promise<[undefined, boolean] | [Error]> {
  try {
    const data = await s3Client().send(
      new HeadBucketCommand({ Bucket: bucketName })
    );

    if (data.$metadata.httpStatusCode === 200) {
      return [undefined, true];
    }

    return [undefined, false];
  } catch (err) {
    // 301 etc are thrown as errors by the s3 client
    if ((<any>err).$metadata.httpStatusCode === 301) {
      return [undefined, false];
    }

    return [err as Error];
  }
}
