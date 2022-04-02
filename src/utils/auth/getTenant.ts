import { DecodedToken } from '../../definitions/auth';
import { Tenant } from '../../definitions/root';
import { decrypt } from '../crypto.utils';

export function getTenant(tkn: DecodedToken): Tenant | undefined {
  let name = '';
  let ns = `https://${process.env.NAMESPACE}/app_metadata`;
  if (tkn[ns]?.tenant) name = decrypt(tkn[ns].tenant) as string;

  if (!name) return undefined;

  return {
    name: name,
    bucket: {
      exists: false,
      name: `${process.env.BUCKET_NAMESPACE}-${name.toLowerCase()}-app`,
    },
  };
}
