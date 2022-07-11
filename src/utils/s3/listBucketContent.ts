import { ListObjectVersionsCommand, ObjectVersion } from '@aws-sdk/client-s3';
import normalize from 'normalize-path';
import formatPath from '../tools/formatPath.utils';
import getFileExtension from '../tools/getFileExtension.utils';
import s3Client from './s3Client';
import { File, Version } from '../../definitions/generated/graphql';
import { RequestBody } from '../../definitions/root';
import { DeleteMarker, Directory } from '../../definitions/s3';
import isDirectory from '../tools/isDirectory.utils';

interface ListBucketContentArgs {
  req: RequestBody;
  bucketName: string;
  root: string;
  path?: string;
  getDeleteMarkers?: boolean;
  getDirs?: boolean;
}

export default async function listBucketContent(
  args: ListBucketContentArgs
): Promise<
  | [undefined, File[]]
  | [undefined, File[], DeleteMarker[]]
  | [undefined, File[], Directory[]]
  | [undefined, File[], DeleteMarker[], Directory[]]
  | [Error]
> {
  try {
    const root = normalize(args.root);
    const path = normalize(args.path || '');
    const fullPath = formatPath(`${root}/${path}/`, { stripTrailing: false });
    const data: any = [];

    const params = {
      Bucket: args.bucketName,
      Prefix: fullPath,
    };

    const res = await s3Client().send(new ListObjectVersionsCommand(params));

    const status = res?.$metadata.httpStatusCode || 500;

    if (status >= 200 && status <= 299) {
      const files =
        res.Versions?.filter(
          (v: ObjectVersion) => v.Key && getFileExtension(v.Key)
        ) || [];

      const versions = files.filter((f: ObjectVersion) => !f.IsLatest);

      const dirSet = [
        ...new Set<Directory>(
          res.Versions?.filter((v: ObjectVersion) => isDirectory(v.Key!)).map(
            (d) => ({ path: d.Key!, id: d.VersionId! })
          )
        ),
      ];

      const dirs: Directory[] = dirSet.map((d) => ({
        path: normalize(`${d.path.replace(`${root}/`, '')}/`, false),
        id: d.id,
      }));

      const markers: DeleteMarker[] =
        res.DeleteMarkers?.filter((m) => m.Key && m.VersionId !== 'null').map(
          (m) => {
            const mname =
              m.Key === fullPath ? m.Key : m.Key!.replace(fullPath, '');
            const mpath = `${normalize(
              m.Key!.replace(`${mname}/`, ''),
              false
            )}`;

            return {
              name: mname,
              id: m.VersionId!,
              path: mpath,
              isLatest: m.IsLatest!,
            };
          }
        ) || [];

      const fileList: File[] = files!
        .filter((f: ObjectVersion) => f.IsLatest)
        .map((f) => {
          const filePath = `${f.Key!.slice(0, f.Key!.lastIndexOf('/'))}/`;

          return {
            id: f.VersionId,
            name: f.Key!.replace(filePath, ''),
            lastModified: f.LastModified!.toISOString(),
            size: f.Size!,
            path: filePath,
            versions: [] as Version[],
          };
        });

      if (args.req.body.tenant.bucket.isVersioned)
        for (const f of fileList) {
          f.versions = versions!
            .filter((v) => normalize(v.Key!).split('/').pop() === f.name)
            .map(
              (v) =>
                ({
                  id: v.VersionId,
                  name: normalize(v.Key!).split('/').pop(),
                  lastModified: v.LastModified!.toISOString(),
                  size: v.Size,
                  path: v.Key!.replace(normalize(v.Key!).split('/').pop()!, ''),
                } as Version)
            );
        }

      data.push(undefined);
      data.push(fileList);
      if (args.getDeleteMarkers) data.push(markers);
      if (args.getDirs) data.push(dirs);

      return data;
    }

    throw new Error(`Could not get contents: ${status}`);
  } catch (err) {
    return [err as Error];
  }
}
