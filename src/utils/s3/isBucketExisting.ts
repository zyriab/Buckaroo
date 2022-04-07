import { ListBucketsCommand } from '@aws-sdk/client-s3';
import s3Client from './s3Client';

export default async function isBucketExisting(
  bucketName: string
): Promise<[undefined, boolean] | [Error]> {
  try {
    const data = await s3Client().send(new ListBucketsCommand({}));

    if (!data.Buckets || data.Buckets!.length === 0) {
      return [undefined, false];
    }

    for (const b of data.Buckets) {
      if (b.Name === bucketName) {
        return [undefined, true];
      }
    }

    return [undefined, false];
  } catch (err) {
    return [err as Error];
  }
}
