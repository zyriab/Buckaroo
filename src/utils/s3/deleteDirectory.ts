import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import normalize from 'normalize-path';
import s3Client from './s3Client';
import deleteManyFiles from './deleteManyFiles';
import listBucketContent from './listBucketContent';
import { RequestBody } from '../../definitions/root';
import { DeleteMarker, Directory } from '../../definitions/s3';
import deleteOneFile from './deleteOneFile';

interface InputArgs {
  req: RequestBody;
  path: string;
  root: string;
  bucketName?: string;
}

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

    if (files!.length > 0) {
      files!.sort(
        (a, b) =>
          normalize(b.path).split('/').length -
          normalize(a.path).split('/').length
      );

      for (const f of files!) {
        // first deleting file versions
        if (f.versions!.length > 0) {
          // eslint-disable-next-line no-await-in-loop
          const [err] = await deleteManyFiles({
            req: args.req,
            fileNames: f.versions!.map((v) => v.name),
            root,
            path: f.path.replace(root, ''),
            versionIds: args.req.body.tenant.bucket.isVersioned
              ? f.versions!.map((v) => v.id)
              : undefined,
          });

          if (err) throw err;
        }

        // TODO: see about optimizing this call
        // eslint-disable-next-line no-await-in-loop
        const [error] = await deleteOneFile({
          req: args.req,
          fileName: f.name,
          root,
          path: f.path.replace(root, ''),
          versionId: args.req.body.tenant.bucket.isVersioned
            ? f.id!
            : undefined,
        });

        if (error) throw error;
      }
    }

    // FIXME: deleting markers might generate new files, need to recall the function
    if (markers!.length > 0) {
      markers!.sort(
        (a, b) =>
          normalize(b.path).split('/').length -
          normalize(a.path).split('/').length
      );

      for (const m of <DeleteMarker[]>markers!) {
        // TODO: see about optimizing this call
        // eslint-disable-next-line no-await-in-loop
        const [error] = await deleteOneFile({
          req: args.req,
          fileName: m.name,
          root,
          path: m.path.replace(root, ''),
          versionId: args.req.body.tenant.bucket.isVersioned
            ? m.id!
            : undefined,
        });

        if (error) throw error;
      }
    }

    // deleting empty folders
    if (dirs!.length > 0) {
      (<Directory[]>dirs).sort(
        (a, b) =>
          normalize(b.path).split('/').length -
          normalize(a.path).split('/').length
      );

      const res = await s3Client().send(
        new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: dirs!.map((d) => ({
              Key: normalize(`${root}/${d.path}`, false),
              VersionId: d.id,
            })),
          },
        })
      );

      const status = res.$metadata.httpStatusCode || 500;

      if (status < 200 || status > 299) {
        throw new Error(
          `Could not delete folder: ${status}. Some objects inside may have been deleted.`
        );
      }
    }

    // TODO: maybe return the number of objects deleted
    return [undefined, true];
  } catch (err) {
    return [err as Error];
  }
}
