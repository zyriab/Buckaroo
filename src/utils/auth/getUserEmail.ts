import { DecodedToken } from '../../definitions/auth';

export function getUserEmail(
  tkn: DecodedToken,
  tenant: string
): string | false {
  let ns = `https://${process.env.NAMESPACE}/${tenant}/email`;
  if (tkn[ns]) return tkn[ns];
  return false;
}
