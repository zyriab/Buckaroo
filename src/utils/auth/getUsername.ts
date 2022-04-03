import { DecodedToken } from '../../definitions/auth';

export function getUsername(tkn: DecodedToken): string | false {
  let ns = `https://${process.env.NAMESPACE}/username`;
  if (tkn[ns]) return tkn[ns];
  return false;
}
