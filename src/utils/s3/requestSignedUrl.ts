import { RequestBody, ReqCommand } from '../../definitions/root';
import {
  PutObjectCommand,
  GetObjectCommand,
  ServiceOutputTypes,
  QuoteFields,
} from '@aws-sdk/client-s3';
import { s3Client } from './s3Client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost, PresignedPost } from '@aws-sdk/s3-presigned-post';
import { getFileSizeRange, Filetype } from '../tools/getFileSizeRange.utils';
import sanitize from 'sanitize-filename';
import normalize from 'normalize-path';

interface InputArgs {
  req: RequestBody;
  reqCommand: ReqCommand;
  fileName: string;
  path: string;
  versionId?: string;
  fileType?: Filetype;
}

export async function requestSignedUrl(
  args: InputArgs
): Promise<
  | [undefined, string]
  | [undefined, string, { key: string; value: string }[]]
  | [Error]
> {
  try {
    // TODO: IMPLEMENT UPLOAD

    let command: any;
    let res: string | PresignedPost | ServiceOutputTypes;
    const client = s3Client();
    const dirName = `${args.req.body.userName}-${args.req.body.userId}`;
    const fileName = sanitize(args.fileName);
    const sizeRange = getFileSizeRange(args.fileType);
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 1);
    const expirationTime = 60 * 1;

    const policy = {
      expiration: expirationDate.toISOString,
      conditions: [
        // { bucket: args.req.body.tenant.bucket.name },
        // [
        //   'starts-with',
        //   '$key',
        //   `${dirName}/${normalize(args.path)}/${fileName}`,
        // ],
        // sizeRange,
      ],
    };

    let params = {
      Bucket: args.req.body.tenant.bucket.name,
      Key: `${dirName}/${normalize(args.path)}/${fileName}`,
    };

    switch (args.reqCommand) {
      case 'DOWNLOAD':
        command = new GetObjectCommand(params);
        break;
      case 'UPLOAD':
        command = new PutObjectCommand(params);
        break;
    }

    if (args.reqCommand === 'DOWNLOAD') {
      res = await getSignedUrl(client, command, {
        expiresIn: expirationTime,
      });
      return [undefined, res];
    }

    if (args.reqCommand === 'UPLOAD') {
      res = (await createPresignedPost(client, {
        Bucket: args.req.body.tenant.bucket.name,
        Key: `${dirName}/${normalize(args.path)}/${fileName}`,
        // Fields: { Key: fileName },
        Expires: 1,
      })) as PresignedPost;

      const fields = [
        ...Object.entries(res.fields).map(([k, v]) => {
          return { key: k, value: v };
        }),
      ];

      return [undefined, res.url, fields];
    }

    throw new Error('Something went wrong...');
  } catch (err: any) {
    return [err as Error];
  }
}
