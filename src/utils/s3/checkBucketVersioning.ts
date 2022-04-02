import { RequestBody } from '../../definitions/root';
import { GetBucketVersioningCommand } from '@aws-sdk/client-s3';
import { s3Client } from './s3Client';

interface InputArgs {
  bucketName: string;
}

export async function checkBucketVersioning(
  args: InputArgs
): Promise<[undefined, boolean] | [Error]> {
  try {
    const res = await s3Client().send(
      new GetBucketVersioningCommand({ Bucket: args.bucketName })
    );

    return [undefined, res.Status === 'Enabled'];
  } catch (err) {
    return [err as Error];
  }
}
