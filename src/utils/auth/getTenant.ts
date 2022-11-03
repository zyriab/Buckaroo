import { DecodedToken } from '../../definitions/auth';
import { Tenant } from '../../definitions/root';
import { decrypt } from '../crypto.utils';

export default function getTenant(tkn: DecodedToken): Tenant | undefined {
  let name = '';
  let bucketName = '';
  const ns = `https://${process.env.NAMESPACE}/app_metadata`;
  if (tkn[ns]?.tenant) name = `${decrypt(tkn[ns].tenant)}`;

  if (!name) return undefined;

  name = name.replace('-dev', '');
  name = name.replace('-staging', '');

  switch (process.env.NODE_ENV) {
    case 'development':
      bucketName = `${
        process.env.BUCKET_NAMESPACE
      }${name.toLowerCase()}-app-development`;
      break;
    case 'staging':
      bucketName = `${
        process.env.BUCKET_NAMESPACE
      }${name.toLowerCase()}-app-staging`;
      break;
    case 'production':
      bucketName = `${process.env.BUCKET_NAMESPACE}${name.toLowerCase()}-app`;
      break;
    default:
      bucketName = 'test-bucket';
      break;
  }

  return {
    name,
    bucket: {
      isVersioned: false,
      // i.e.: NAMESPACE-APP_NAME-app[-staging | -development]
      name: bucketName,
    },
  };
}
