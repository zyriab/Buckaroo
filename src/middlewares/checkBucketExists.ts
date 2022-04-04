import { RequestBody, ResponseBody } from '../definitions/root';
import { isBucketExisting } from '../utils/s3.utils';

export async function checkBucketExists(
  req: RequestBody,
  res: ResponseBody<any>,
  next: () => void
) {
  try {
    if (!req.body.isAuth) {
      req.body.tenant.bucket.exists = false;
      return next();
    }

    const [error, exists] = await isBucketExisting(
      req.body.tenant.bucket.name
    );

    if (error) throw error;

    if (!exists) {
      req.body.tenant.bucket.exists = false;
      return next();
    }

    req.body.tenant.bucket.exists = true;
    next();
  } catch (err) {
    return next();
  }
}
