import { DecodedToken } from '../../definitions/auth';

export function getUserId(token: DecodedToken): string {
  return token.sub.split('|')[1] || '';
}
