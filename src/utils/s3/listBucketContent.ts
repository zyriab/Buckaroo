import { RequestBody } from '../../definitions/root';
import { File, Version } from '../../definitions/generated/graphql';
import {
  DeleteMarkerEntry,
  ListObjectVersionsCommand,
  ObjectVersion,
} from '@aws-sdk/client-s3';
import { s3Client } from './s3Client';
import normalize from 'normalize-path';

interface InputArgs {
  req: RequestBody;
  path?: string;
  getMarkersIds?: boolean;
  getDirs?: boolean;
  showRoot?: boolean;
}

export interface MarkerData {
  name: string;
  id: string;
}

export async function listBucketContent(
  args: InputArgs
): Promise<
  | [undefined, File[]]
  | [undefined, File[], MarkerData[]]
  | [undefined, File[], string[]]
  | [undefined, File[], MarkerData[], string[]]
  | [Error]
> {
  try {
    const dirName = args.showRoot
      ? ''
      : `${args.req.body.username}-${args.req.body.userId}/`;
    const prefix = args.path
      ? `${dirName}${normalize(args.path)}/`
      : `${dirName}`;
    const params = { Bucket: args.req.body.tenant.bucket.name, Prefix: prefix };
    const res = await s3Client().send(new ListObjectVersionsCommand(params));
    const data: any = [];

    const status = res.$metadata.httpStatusCode;
    if (status && status >= 200 && status <= 299) {
      // Returns file extension if there's one or undefined if not, /folder.name/ returns undefined
      const fileExtensionRegExp = /(?:\.([^./]+))?$/;
      const files =
        res.Versions?.filter(
          (v: ObjectVersion) =>
            v.Key && fileExtensionRegExp.exec(v.Key)![1] !== undefined
        ) || [];
      const versions = files.filter((f: ObjectVersion) => !f.IsLatest);
      const dirSet = [
        ...new Set(
          res.Versions?.map((v: ObjectVersion) => {
            const a = v.Key!.split('/');
            fileExtensionRegExp.exec(a[a.length - 1])![1] !== undefined
              ? a.pop()
              : '';
            return a.join('/');
          })
        ),
      ];
      const dirs = dirSet.filter((d) => normalize(`${d}/`, false) !== prefix);

      const markers =
        res.DeleteMarkers?.filter(
          (m: DeleteMarkerEntry) =>
            m.Key && m.VersionId !== 'null' && m.Key !== prefix
        ).map((m) => {
          return { name: m.Key!.replace(prefix, ''), id: m.VersionId! };
        }) || [];

      const fileList = files!
        .filter((f: ObjectVersion) => f.IsLatest)
        .map((f) => {
          return {
            id: f.VersionId!,
            name: f.Key?.replace(prefix, '')!,
            lastModified: f.LastModified?.toISOString()!,
            size: f.Size!,
            path: prefix,
            versions: [] as Version[],
          };
        });

      for (const f of fileList) {
        f.versions = versions!
          .filter((v) => v.Key?.replace(prefix, '') === f.name)
          .map((v) => {
            return {
              id: v.VersionId!,
              name: v.Key?.replace(prefix, '')!,
              lastModified: v.LastModified?.toISOString()!,
              size: v.Size!,
              path: prefix,
            } as Version;
          });
      }

      data.push(undefined);
      data.push(fileList);
      if (args.getMarkersIds) data.push(markers);
      if (args.getDirs) data.push(dirs);

      return data;
    }

    throw new Error(`Could not get contents: ${status}`);
  } catch (err) {
    return [err as Error];
  }
}
