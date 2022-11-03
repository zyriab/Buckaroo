import decrypt from '../crypto/decryptAES';
import { AUTH0_DOMAINS } from '../../helpers/constants.help';

export default function getIssuerUrl(encryptedTenant: string) {
  return AUTH0_DOMAINS.get(decrypt(encryptedTenant).toString().toLowerCase());
}
