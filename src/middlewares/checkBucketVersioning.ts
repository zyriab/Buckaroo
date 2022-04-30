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

    if (req.body.tenant.name === 's3-versioning-control') {
      req.body.tenant.bucket.isVersioned = true;
      return next();
    }

    const [error, exists] = await isBucketVersioned(req.body.tenant.bucket.name);

    if (error) throw error;

    if (!exists) {
      req.body.tenant.bucket.isVersioned = false;
      return next();
    }

    req.body.tenant.bucket.isVersioned = true;
    next();
  } catch (err) {
    return next();
  }
}
