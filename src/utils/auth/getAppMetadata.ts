import { DecodedToken, AppMetadata } from '../../definitions/auth';

export function getAppMetadata(
  tkn: DecodedToken,
  tenant: string
): AppMetadata | undefined {
  let ns = `https://${process.env.NAMESPACE}/${tenant}/app_metadata`;
  if (tkn[ns]) return tkn[ns];
  return undefined;
}
