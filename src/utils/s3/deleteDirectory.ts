import { RequestBody } from '../../definitions/root';
import { deleteManyFiles, listBucketContent } from '../s3.utils';
import { s3Client } from './s3Client';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import normalize from 'normalize-path';
import { MarkerData } from './listBucketContent';

interface InputArgs {
  req: RequestBody;
  dirPath: string;
  bucketName?: string;
}

export async function deleteDirectory(
  args: InputArgs
): Promise<[undefined, boolean] | [Error]> {
  try {
    const path = normalize(args.dirPath);
    const bucketName = args.bucketName || args.req.body.tenant.bucket.name;

    const [fail, files, markers, dirs] = await listBucketContent({
      req: args.req,
      path,
      getMarkersIds: true,
      getDirs: true,
      showRoot: true,
    });

    if (fail) throw fail;

    if (dirs!.length > 0)
      for (const d of dirs!) {
        const [error] = await deleteDirectory({
          req: args.req,
          dirPath: <string>d,
          bucketName,
        });
        if (error) throw error;
      }

    if (files!.length > 0) {
      const [error] = await deleteManyFiles({
        req: args.req,
        fileNames: files!.map((f) => f.name),
        path,
        root: true,
      });
      if (error) throw error;
    }

    const res = await s3Client().send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: `${path}/`,
      })
    );

    const status = res ? res.$metadata.httpStatusCode : 500;

    if (status && status >= 200 && status <= 299) return [undefined, true];

    throw new Error(
      `Could not delete folder: ${status}. Some objects inside may have been deleted.`
    );
  } catch (err) {
    return [err as Error];
  }
}
