import { hasJsonStructure } from '../json/json.utils';
import AES from 'crypto-js/aes';

export function encryptAES(data: string | Object, key?: string): string | false {
  const dt = data;
  if (typeof dt === 'string') {
    return AES.encrypt(dt, <string>(key || process.env.AES_KEY)).toString();
  } else if (typeof dt === 'object' && hasJsonStructure(JSON.stringify(dt))) {
    return AES.encrypt(
      JSON.stringify(dt),
      <string>(key || process.env.AES_KEY)
    ).toString();
  }
  return false;
}
