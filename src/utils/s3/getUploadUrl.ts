import {
  createPresignedPost,
  PresignedPost,
  PresignedPostOptions,
} from '@aws-sdk/s3-presigned-post';
import sanitize from 'sanitize-filename';
import normalize from 'normalize-path';
import s3Client from './s3Client';
import { getFileExtension, getFileSizeRange, formatPath } from '../tools.utils';
import { FileType } from '../../definitions/types';

interface GetUploadUrlArgs {
  fileName: string;
  fileType: FileType;
  root: string;
  path: string;
  bucketName: string;
}

export default async function getUploadUrl(
  args: GetUploadUrlArgs
): Promise<[undefined, PresignedPost] | [Error]> {
  try {
    const fileName = sanitize(args.fileName);
    const root = normalize(args.root);
    const path = normalize(args.path);
    const fullPath = formatPath(`${root}/${path}/`, { stripTrailing: false });
    const expirationTime = 30; // seconds before the presigned post expires. 3600 by default.

    const params: PresignedPostOptions = {
      Bucket: args.bucketName,
      Key: `${fullPath}${fileName}`,
      Expires: expirationTime,
      Conditions: [
        getFileSizeRange(args.fileType),
        ['starts-with', '$key', fullPath],
      ],
      Fields: {
        'Content-Type': `${args.fileType}/${getFileExtension(fileName)}`,
      },
    };

    const presignedPost = await createPresignedPost(s3Client(), params);

    return [undefined, presignedPost];
  } catch (err) {
    return [err as Error];
  }
}
