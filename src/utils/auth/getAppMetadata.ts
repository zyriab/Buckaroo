import { DecodedToken, AppMetadata } from '../../definitions/auth';

export function getAppMetadata(tkn: DecodedToken): AppMetadata | undefined {
  let ns = `https://${process.env.NAMESPACE}/app_metadata`;
  if (tkn[ns]) return tkn[ns];
  return undefined;
}
