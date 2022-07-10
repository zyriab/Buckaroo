export type Permission = 'read:bucket' | 'delete:directory' | 'create:file' | 'update:file' | 'delete:file' | 'read:file'

export interface AccessToken {
  decoded?: DecodedToken;
  error?: SignError;
}

export interface DecodedToken extends AuthMetadata {
  aud: string[];
  azp: string;
  exp: number;
  iat: number;
  iss: string;
  permissions: Role[];
  scope: string;
  sub: string;
}

export interface AppMetadata {
  tenant?: string;
}

interface AuthMetadata {
  [key: string]: string | string[] | TenantData | any;
}

interface SignError {
  message: string;
  name: string;
  stack: string;
}
