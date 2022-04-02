import { hasJsonStructure, safeJsonParse } from '../json/json.utils';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8'

export function decryptAES(
  data: string,
  key: string = ''
): string | object | false {
  if (typeof data === 'string') {
    const dt = data;
    const d = AES.decrypt(dt, <string>(key || process.env.AES_KEY)).toString(
      Utf8
    );
    return hasJsonStructure(d) ? JSON.parse(d) : d;
  }
  return false;
}
