import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
} from '@aws-sdk/client-s3';
import normalize from 'normalize-path';
import s3Client from './s3Client';
import deleteManyFiles from './deleteManyFiles';
import listBucketContent from './listBucketContent';
import { RequestBody } from '../../definitions/root';
import { DeleteMarker, Directory } from '../../definitions/s3';

interface InputArgs {
  req: RequestBody;
  path: string;
  root: string;
  bucketName?: string;
}

// TODO: Need to see if there's a way to see if something was deleted or no...
// because, as is, it returns true even when the directory doesn't exist
export default async function deleteDirectory(
  args: InputArgs
): Promise<[undefined, boolean] | [Error]> {
  try {
    const path = normalize(args.path);
    const root = normalize(args.root);
    const bucketName = args.bucketName || args.req.body.tenant.bucket.name;

    // eslint-disable-next-line prefer-const
    let [fail, files, markers, dirs] = await listBucketContent({
      req: args.req,
      root,
      path,
      getDirs: true,
      getDeleteMarkers: true,
    });

    if (fail) throw fail;

    // First we sort the directory names by farthest from root to closest
    // then we iterate through the directories array and delete each files
    // then we delete the remaining delete markers if there's any
    if (dirs!.length > 0) {
      (<Directory[]>dirs).sort(
        (a, b) =>
          normalize(b.path).split('/').length -
          normalize(a.path).split('/').length
      );

      for (const d of dirs!) {
        let error: any;
        const dirFiles = files!.filter(
          (f) => normalize(f.path) === normalize(`${root}/${d.path}`)
        );
        const dirMarkers = (markers as DeleteMarker[])!.filter(
          (m) => normalize(m.path) === normalize(`${root}/${m.path}`)
        );

        if (dirFiles.length > 0) {
          // eslint-disable-next-line no-await-in-loop
          [error] = await deleteManyFiles({
            req: args.req,
            fileNames: dirFiles.map((f) => f.name),
            root,
            path: d.path,
            versionIds: args.req.body.tenant.bucket.isVersioned
              ? dirFiles.map((f) => f.id!)
              : undefined,
          });

          if (error) throw error;

          files = files!.filter((f) =>
            dirFiles.map((df) => df.name).includes(f.name)
          );
        }

        if (dirMarkers.length > 0) {
          // eslint-disable-next-line no-await-in-loop
          [error] = await deleteManyFiles({
            req: args.req,
            fileNames: dirMarkers.map((m) => m.name),
            root,
            path: d.path,
            versionIds: args.req.body.tenant.bucket.isVersioned
              ? dirMarkers.map((m) => m.id!)
              : undefined,
          });

          if (error) throw error;

          markers = (markers as DeleteMarker[])!.filter((m) =>
            dirMarkers.map((dm) => dm.name).includes(m.name)
          );
        }

        // deleting empty dir (if there's files, gets automatically deleted)
        if (dirFiles.length === 0 && dirMarkers.length === 0) {
          // eslint-disable-next-line no-await-in-loop
          const res = await s3Client().send(
            new DeleteObjectCommand({
              Bucket: bucketName,
              Key: normalize(`${root}/${d.path}/`, false),
              VersionId: d.id,
            })
          );

          const status = res ? res.$metadata.httpStatusCode : 500;
          if (status && status <= 200 && status >= 299)
            throw new Error(
              `Could not delete folder: ${status}. Some objects inside may have been deleted.`
            );
        }
      }
    }

    // If anything is present in the root folder
    if (files!.length > 0 || markers!.length > 0) {
      files!.sort(
        (a, b) =>
          normalize(b.path).split('/').length -
          normalize(a.path).split('/').length
      );

      markers!.sort(
        (a, b) =>
          normalize(b.path).split('/').length -
          normalize(a.path).split('/').length
      );

      let error: any;
      if (files!.length > 0) {
        [error] = await deleteManyFiles({
          req: args.req,
          fileNames: files!.map((f) => f.name),
          root,
          path,
          versionIds: args.req.body.tenant.bucket.isVersioned
            ? files!.map((f) => f.id!)
            : undefined,
        });

        if (error) throw error;
      }

      if (markers!.length > 0) {
        [error] = await deleteManyFiles({
          req: args.req,
          fileNames: (markers as DeleteMarker[])!.map((m) =>
            m.name !== `${root}/` ? m.name : ''
          ),
          root,
          path,
          versionIds: args.req.body.tenant.bucket.isVersioned
            ? (markers as DeleteMarker[])!.map((m) => m.id!)
            : undefined,
        });

        if (error) throw error;
      }
    }

    let res: DeleteObjectCommandOutput;
    let statusCode: number;
    if (dirs!.length > 0) {
      res = await s3Client().send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: normalize(`${root}/`, false),
          VersionId: args.req.body.tenant.bucket.isVersioned
            ? dirs!.find((d) => d.path === '/')!.id
            : 'null',
        })
      );
      statusCode = res ? res.$metadata.httpStatusCode! : 500;

      if (statusCode && statusCode >= 200 && statusCode <= 299)
        return [undefined, true];
    } else return [undefined, true];

    throw new Error(
      `Could not delete folder: ${statusCode}. Some objects inside may have been deleted.`
    );
  } catch (err) {
    return [err as Error];
  }
}
