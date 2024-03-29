import { RequestBody, ResponseBody } from '../definitions/root';
import { isBucketVersioned } from '../utils/s3.utils';

// eslint-disable-next-line consistent-return
export default async function checkBucketVersioning(
  req: RequestBody,
  res: ResponseBody<any>,
  next: () => void
) {
  try {
    if (!req.body.isAuth) {
      req.body.tenant.bucket.isVersioned = false;
      return next();
    }

    const [error, isVersioned] = await isBucketVersioned(
      req.body.tenant.bucket.name
    );

    if (error) throw error;

    req.body.tenant.bucket.isVersioned = isVersioned;
    next();
  } catch (err) {
    return next();
  }
}
