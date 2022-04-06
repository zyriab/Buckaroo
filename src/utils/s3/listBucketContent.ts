import { RequestBody } from '../../definitions/root';
import { File, Version } from '../../definitions/generated/graphql';
import {
  DeleteMarkerEntry,
  ListObjectVersionsCommand,
  ObjectVersion,
} from '@aws-sdk/client-s3';
import { formatPath } from '../tools/formatPath.utils';
import { getFileExtension } from '../tools/getFileExtension.utils';
import { s3Client } from './s3Client';
import normalize from 'normalize-path';

interface InputArgs {
  req: RequestBody;
  root: string;
  path?: string;
  getDeleteMarkers?: boolean;
  getDirs?: boolean;
}

export interface DeleteMarker {
  name: string;
  id: string;
  path: string;
  isLatest: boolean;
}

export interface Directory {
  path: string;
  id: string;
}

export async function listBucketContent(
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
      Bucket: args.req.body.tenant.bucket.name,
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
            getFileExtension(a[a.length - 1]) ? a.pop() : '';
            return { path: a.join('/'), id: v.VersionId! };
          })
        ),
      ];
      const dirs: Directory[] = dirSet.map((d) => {
        return {
          path: normalize(`${d.path.replace(`${root}/`, '')}/`, false),
          id: d.id,
        };
      });

      const markers: DeleteMarker[] =
        res.DeleteMarkers?.filter((m) => m.Key && m.VersionId !== 'null').map(
          (m) => {
            const name =
              m.Key === fullPath ? m.Key : m.Key!.replace(fullPath, '');
            const path = `${normalize(m.Key!.replace(`${name}/`, ''), false)}`;
            return {
              name: name,
              id: m.VersionId!,
              path: path,
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
            .map((v) => {
              return {
                id: v.VersionId,
                name: v.Key!.replace(fullPath, ''),
                lastModified: v.LastModified!.toISOString(),
                size: v.Size,
                path: fullPath,
              } as Version;
            });
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
