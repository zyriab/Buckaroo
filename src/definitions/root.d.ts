import { Request, Response } from 'express';
import { DecodedToken, Permission } from './auth';

export interface Tenant {
  name: string;
  bucket: {
    exists: boolean,
    name: string;
  };
}

export interface RequestBody extends Request {
  body: {
    token: DecodedToken;
    isAuth: boolean;
    userId: string;
    username: string;
    userEmail: string;
    permissions: Permission[];
    tenant: Tenant;
  };
}

export interface ResponseBody<T> extends Response {
  json: Send<T, this>;
}
