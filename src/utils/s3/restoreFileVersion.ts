import { RequestBody } from '../../definitions/root';
import { CopyObjectCommand, CopyObjectCommandInput } from '@aws-sdk/client-s3';
import { s3Client } from './s3Client';
import sanitize from 'sanitize-filename';
import { deleteOneFile } from './deleteOneFile';
import normalize from 'normalize-path'

interface InputArgs {
  req: RequestBody;
  fileName: string;
  path: string;
  versionId: string;
}

export async function restoreFileVersion(
  args: InputArgs
): Promise<[undefined, string] | [Error]> {
  try {
    if (!args.versionId) throw new Error('VersionId is needed');

    const bucket = args.req.body.tenant.bucket.name;
    const dirName = `${args.req.body.userName}-${args.req.body.userId}`;
    const fileName = sanitize(args.fileName);
    const path = normalize(args.path);
    const params: CopyObjectCommandInput = {
      Bucket: bucket,
      CopySource: `${bucket}/${dirName}/${path}/${fileName}?versionId=${args.versionId}`,
      Key: `${dirName}/${path}/${fileName}`,
      MetadataDirective: 'REPLACE',
    };
    const res = await s3Client().send(new CopyObjectCommand(params));

    // FIXME: can return a 200 with error, need to test and handle that
    // @see https://stackoverflow.com/questions/61124130/how-to-catch-failed-s3-copyobject-with-200-ok-result-in-awsjavascriptsdk#:~:text=If%20the%20error%20occurs%20before%20the%20copy%20operation,can%20contain%20either%20a%20success%20or%20an%20error.
    if (res.$metadata.httpStatusCode !== 200)
      throw new Error(
        `Could not perform the copy. The server returned the error code: ${res.$metadata.httpStatusCode}`
      );

    const [error] = await deleteOneFile({ req: args.req, fileName, path, versionId: args.versionId });

    if (error) throw error;

    return [undefined, res.VersionId!];
  } catch (err) {
    return [err as Error];
  }
}