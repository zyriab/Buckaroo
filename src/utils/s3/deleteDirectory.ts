import { RequestBody } from '../../definitions/root';
import { deleteManyFiles, listBucketContent } from '../s3.utils';
import { s3Client } from './s3Client';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import normalize from 'normalize-path';
import { DeleteMarker } from './listBucketContent';

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
      getDirs: true,
      getDeleteMarkers: true,
      showRoot: true,
    });

    if (fail) throw fail;

    // First we sort the directory names by farthest from root to closest
    // then we iterate through the directories array and delete each files
    // then we delete the remaining delete markers if there's any
    if (dirs!.length > 0) {
      (<string[]>dirs).sort(
        (a, b) =>
          normalize(b).split('/').length - normalize(a).split('/').length
      );

      for (const d of dirs!) {
        let [error] = await deleteManyFiles({
          req: args.req,
          fileNames: files!.filter((f) => f.path === d).map((f) => f.name),
          path: <string>d,
          versionIds: args.req.body.tenant.bucket.isVersioned
            ? files!.filter((f) => f.path === d).map((f) => f.id!)
            : undefined,
        });

        if (error) throw error;

        [error] = await deleteManyFiles({
          req: args.req,
          fileNames: (markers as DeleteMarker[])!
            .filter((f) => f.path === d)
            .map((f) => f.name),
          path: <string>d,
          versionIds: args.req.body.tenant.bucket.isVersioned
            ? (markers as DeleteMarker[])!
                .filter((f) => f.path === d)
                .map((f) => f.id!)
            : undefined,
        });

        if (error) throw error;
      }
    } else {
      let [error] = await deleteManyFiles({
        req: args.req,
        fileNames: files!.map((f) => f.name),
        path,
        versionIds: args.req.body.tenant.bucket.isVersioned
          ? files!.map((f) => f.id!)
          : undefined,
      });

      if (error) throw error;

      [error] = await deleteManyFiles({
        req: args.req,
        fileNames: (markers as DeleteMarker[])!.map((f) => f.name),
        path,
        versionIds: args.req.body.tenant.bucket.isVersioned
          ? (markers as DeleteMarker[])!.map((f) => f.id!)
          : undefined,
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
