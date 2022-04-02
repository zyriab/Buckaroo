import { DecodedToken } from '../../definitions/auth';

export function getUserNickname(
  tkn: DecodedToken,
  tenant: string
): string | false {
  let ns = `https://${process.env.NAMESPACE}/${tenant}/nickname`;
  if (tkn[ns]) return tkn[ns];
  return false;
}
