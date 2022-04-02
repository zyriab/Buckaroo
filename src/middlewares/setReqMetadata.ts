import {
  getUserId,
  getUserEmail,
  getTenant,
  getUserNickname,
} from '../utils/auth.utils';
import { RequestBody, ResponseBody } from '../definitions/root';

export async function setReqMetadata(
  req: RequestBody,
  res: ResponseBody<any>,
  next: () => void
) {
  try {
    if (!req.body.isAuth) next();

    let email, nickname;
    const tkn = req.body.token;
    const tenant = getTenant(tkn);

    if (!tenant) {
      req.body.isAuth = false;
      req.body.tenant.bucket.exists = false;
      res.status(404);
      next();
    }

    email = getUserEmail(tkn, tenant!.name);

    if (!email) {
      req.body.isAuth = false;
      res.status(404);
      next();
    }

    nickname = getUserNickname(tkn, tenant!.name);

    if (!nickname) {
      req.body.isAuth = false;
      res.status(404);
      next();
    }

    req.body.tenant = tenant!;
    req.body.userName = nickname! as string;
    req.body.userEmail = email! as string;
    req.body.userId = getUserId(tkn);
    req.body.permissions = tkn.permissions;

    next();
  } catch (err) {
    req.body.isAuth = false;
    res.status(500);
    next();
  }
}
