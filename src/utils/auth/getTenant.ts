import { DecodedToken } from '../../definitions/auth';
import { Tenant } from '../../definitions/root';
import { decrypt } from '../crypto.utils';

export default function getTenant(tkn: DecodedToken): Tenant | undefined {
  let name = '';
  const ns = `https://${process.env.NAMESPACE}/app_metadata`;
  if (tkn[ns]?.tenant) name = decrypt(tkn[ns].tenant) as string;

  if (!name) return undefined;

  return {
    name,
    bucket: {
      isVersioned: false,
      // i.e.: NAMESPACE-APP_NAME-app-staging
      name: `${process.env.BUCKET_NAMESPACE}${name.toLowerCase()}-app-${
        process.env.NODE_ENV
      }`,
    },
  };
}
