import {
  createPresignedPost,
  PresignedPost,
  PresignedPostOptions,
} from '@aws-sdk/s3-presigned-post';
import sanitize from 'sanitize-filename';
import normalize from 'normalize-path';
import formatPath from '../tools/formatPath.utils';
import getFileSizeRange from '../tools/getFileSizeRange.utils';
import s3Client from './s3Client';
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
    const expirationTime = 60 * 0.5;

    const params: PresignedPostOptions = {
      Bucket: args.bucketName,
      Key: `${fullPath}${fileName}`,
      Expires: expirationTime,
      Conditions: [getFileSizeRange(args.fileType)],
    };

    const presignedPost = await createPresignedPost(s3Client(), params);

    return [undefined, presignedPost];
  } catch (err) {
    return [err as Error];
  }
}
