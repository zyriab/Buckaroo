import { ListObjectVersionsCommand, ObjectVersion } from '@aws-sdk/client-s3';
import normalize from 'normalize-path';
import formatPath from '../tools/formatPath.utils';
import getFileExtension from '../tools/getFileExtension.utils';
import s3Client from './s3Client';
import { File, Version } from '../../definitions/generated/graphql';
import { RequestBody } from '../../definitions/root';
import { DeleteMarker, Directory } from '../../definitions/s3';

interface InputArgs {
  req: RequestBody;
  root: string;
  path?: string;
  getDeleteMarkers?: boolean;
  getDirs?: boolean;
  bucketName?: string;
}

export default async function listBucketContent(
  args: InputArgs
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
    const params = {
      Bucket: args.bucketName || args.req.body.tenant.bucket.name,
      Prefix: fullPath,
    };
    const res = await s3Client().send(new ListObjectVersionsCommand(params));
    const data: any = [];

    const status = res.$metadata.httpStatusCode;
    if (status && status >= 200 && status <= 299) {
      const files =
        res.Versions?.filter(
          (v: ObjectVersion) => v.Key && getFileExtension(v.Key)
        ) || [];
      const versions = files.filter((f: ObjectVersion) => !f.IsLatest);
      const dirSet = [
        ...new Set<Directory>(
          res.Versions?.map((v: ObjectVersion) => {
            const a = v.Key!.split('/');
            if (getFileExtension(a[a.length - 1])) a.pop();
            return { path: a.join('/'), id: v.VersionId! };
          })
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
            .filter((v) => v.Key!.replace(fullPath, '') === f.name)
            .map(
              (v) =>
                ({
                  id: v.VersionId,
                  name: v.Key!.replace(fullPath, ''),
                  lastModified: v.LastModified!.toISOString(),
                  size: v.Size,
                  path: fullPath,
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
