import { CopyObjectCommand } from '@aws-sdk/client-s3';
import sanitize from 'sanitize-filename';
import normalize from 'normalize-path';
import formatPath from '../tools/formatPath.utils';
import s3Client from './s3Client';
import deleteOneFile from './deleteOneFile';
import { RequestBody } from '../../definitions/root';

interface RestoreFileVersionArgs {
  req: RequestBody;
  fileName: string;
  root: string;
  path: string;
  bucketName: string;
  versionId: string;
}

export default async function restoreFileVersion(
  args: RestoreFileVersionArgs
): Promise<[undefined, string] | [Error]> {
  try {
    const root = normalize(args.root);
    const fileName = sanitize(args.fileName);
    const path = normalize(args.path);
    const fullPath = formatPath(`${root}/${path}/`, { stripTrailing: false });

    const params = {
      Bucket: args.bucketName,
      CopySource: `${args.bucketName}/${fullPath}${fileName}?versionId=${args.versionId}`,
      Key: `${fullPath}${fileName}`,
      MetadataDirective: 'REPLACE',
    };

    const res = await s3Client().send(new CopyObjectCommand(params));

    const status = res?.$metadata.httpStatusCode || 500;

    // TODO: can return a 200 with error, need to test and handle that
    // @see https://stackoverflow.com/questions/61124130/how-to-catch-failed-s3-copyobject-with-200-ok-result-in-awsjavascriptsdk#:~:text=If%20the%20error%20occurs%20before%20the%20copy%20operation,can%20contain%20either%20a%20success%20or%20an%20error.
    if (status < 200 && status > 299) {
      throw new Error(
        `Could not restore file. The server returned the error code: ${res?.$metadata.httpStatusCode}`
      );
    }

    const [error] = await deleteOneFile({
      req: args.req,
      fileName,
      root,
      path,
      bucketName: args.bucketName,
      versionId: args.versionId,
    });

    if (error) throw error;

    return [undefined, res.VersionId!];
  } catch (err) {
    return [err as Error];
  }
}
