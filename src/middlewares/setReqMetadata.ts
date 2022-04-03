import { RequestBody, ResponseBody } from '../definitions/root';
import {
  getUserId,
  getUserEmail,
  getTenant,
  getUsername,
} from '../utils/auth.utils';

export async function setReqMetadata(
  req: RequestBody,
  res: ResponseBody<any>,
  next: () => void
) {
  try {
    if (!req.body.isAuth) next();

    let email, username;
    const tkn = req.body.token;
    const tenant = getTenant(tkn);

    if (!tenant) {
      req.body.isAuth = false;
      req.body.tenant.bucket.exists = false;
      next();
    }

    email = getUserEmail(tkn);

    if (!email) {
      req.body.isAuth = false;
      next();
    }

    username = getUsername(tkn);

    if (!username) {
      req.body.isAuth = false;
      next();
    }

    req.body.tenant = tenant!;
    req.body.username = username! as string;
    req.body.userEmail = email! as string;
    req.body.userId = getUserId(tkn);
    req.body.permissions = tkn.permissions;

    next();
  } catch (err) {
    req.body.isAuth = false;
    next();
  }
}
