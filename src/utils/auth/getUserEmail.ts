import { DecodedToken } from '../../definitions/auth';

export function getUserEmail(tkn: DecodedToken): string | false {
  let ns = `https://${process.env.NAMESPACE}/email`;
  if (tkn[ns]) return tkn[ns];
  return false;
}
