// eslint-disable-next-line import/no-extraneous-dependencies
import { mockClient } from 'aws-sdk-client-mock';
import {
  S3Client,
  HeadObjectCommand,
  HeadBucketCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
  ListObjectVersionsCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export default function s3MockClient() {
  const client = mockClient(S3Client);

  const setup = () => {
    const filePath = 'test-user-1234abcd/translations/';
    const fileKey = 'test-user-1234abcd/translations/example.txt';
    const fileKey2 = 'test-user-1234abcd/translations/example2.txt';
    const bucketName = `${process.env.BUCKET_NAMESPACE}test-bucket-app`;

    client

      /* isFileExisting */
      .on(HeadObjectCommand)
      .rejects({ $metadata: { httpStatusCode: 404 } })
      .on(HeadObjectCommand, { Key: filePath })
      .resolves({ $metadata: { httpStatusCode: 200 } })
      .on(HeadObjectCommand, { Key: 'another-user/' })
      .resolves({ $metadata: { httpStatusCode: 200 } })
      .on(HeadObjectCommand, {
        Key: fileKey,
      })
      .resolves({ $metadata: { httpStatusCode: 200 } })
      .on(HeadObjectCommand, {
        Key: fileKey2,
      })
      .resolves({ $metadata: { httpStatusCode: 200 } })

      /* isBucketExisting */
      .on(HeadBucketCommand)
      .rejects({ $metadata: { httpStatusCode: 301 } })
      .on(HeadBucketCommand, {
        Bucket: bucketName,
      })
      .resolves({ $metadata: { httpStatusCode: 200 } })

      /* deleteOneFile */
      .on(DeleteObjectCommand, {
        Key: fileKey,
      })
      .resolves({ $metadata: { httpStatusCode: 200 } })

      /* deleteManyFiles */
      .on(DeleteObjectsCommand)
      .resolves({ $metadata: { httpStatusCode: 200 } })

      /* restoreFileVersion */
      .on(CopyObjectCommand)
      .resolves({
        VersionId: 'abcdefgh00000000',
        $metadata: { httpStatusCode: 200 },
      })

      /* listBucketContent */
      .on(ListObjectVersionsCommand)
      .resolves({
        DeleteMarkers: [],
        Versions: [],
        $metadata: { httpStatusCode: 200 },
      })
      .on(ListObjectVersionsCommand, { Bucket: bucketName })
      .resolves({
        DeleteMarkers: [],
        Versions: [
          {
            VersionId: 'abcdefgh33333333',
            Key: fileKey,
            IsLatest: false,
            Size: 256,
            LastModified: new Date(),
          },
          {
            VersionId: 'abcdefgh22222222',
            Key: fileKey,
            IsLatest: false,
            Size: 256,
            LastModified: new Date(),
          },
          {
            VersionId: 'abcdefgh33333333',
            Key: fileKey,
            IsLatest: false,
            Size: 256,
            LastModified: new Date(),
          },
          {
            VersionId: 'abcdefgh22222222',
            Key: fileKey,
            IsLatest: false,
            Size: 256,
            LastModified: new Date(),
          },
          {
            VersionId: 'abcdefgh11111111',
            Key: fileKey,
            IsLatest: false,
            Size: 256,
            LastModified: new Date(),
          },
          {
            VersionId: 'abcdefgh00000000',
            Key: fileKey,
            IsLatest: true,
            Size: 256,
            LastModified: new Date(),
          },
          {
            VersionId: 'abcdefgh12345678',
            Key: fileKey2,
            IsLatest: true,
            Size: 256,
            LastModified: new Date(),
          },
          {
            VersionId: 'folderab12345678',
            Key: filePath,
            IsLatest: true,
            Size: 0,
            LastModified: new Date(),
          },
        ],
        $metadata: { httpStatusCode: 200 },
      })
      .on(ListObjectVersionsCommand, {
        Bucket: bucketName,
        Prefix: 'translations/',
      })
      .resolves({
        DeleteMarkers: [],
        Versions: [],
        $metadata: { httpStatusCode: 200 },
      })
      .on(ListObjectVersionsCommand, {
        Bucket: bucketName,
        Prefix: 'another-user/',
      })
      .resolves({
        DeleteMarkers: [],
        Versions: [
          {
            VersionId: 'folderab00000000',
            Key: 'another-user/',
            IsLatest: true,
            Size: 0,
            LastModified: new Date(),
          },
        ],
        $metadata: { httpStatusCode: 200 },
      })

      /* getTextFileContent */
      .on(GetObjectCommand)
      .rejects({ $metadata: { httpStatusCode: 404 } })
      .on(GetObjectCommand, {
        Bucket: bucketName,
        Key: fileKey,
        VersionId: undefined,
      })
      .resolves({
        Body: Readable.from('Latest'),
        $metadata: { httpStatusCode: 200 },
      })
      .on(GetObjectCommand, {
        Bucket: bucketName,
        Key: fileKey,
        VersionId: 'abcd',
      })
      .resolves({
        Body: Readable.from('Older'),
        $metadata: { httpStatusCode: 200 },
      });
  };

  return { client, setup };
}
