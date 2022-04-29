// eslint-disable-next-line import/no-extraneous-dependencies
import { mockClient } from 'aws-sdk-client-mock';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

export default function s3MockClient() {
  const client = mockClient(S3Client);

  const setup = () => {
    client
      .on(HeadObjectCommand)
      .rejects({ $metadata: { httpStatusCode: 404 } })
      .on(HeadObjectCommand, { Key: 'test-user-1234abcd/translations/' })
      .resolves({ $metadata: { httpStatusCode: 200 } })
      .on(HeadObjectCommand, {
        Key: 'test-user-1234abcd/translations/example.txt',
      })
      .resolves({ $metadata: { httpStatusCode: 200 } });
  };

  setup();

  return { client, setup };
}
