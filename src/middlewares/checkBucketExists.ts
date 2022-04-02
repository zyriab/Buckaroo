import { RequestBody, ResponseBody } from '../definitions/root';
import { ListBucketsCommand } from '@aws-sdk/client-s3';
import {
  s3Client,
  checkBucketExists as checkBucketExistUtils,
} from '../utils/s3.utils';

export async function checkBucketExists(
  req: RequestBody,
  res: ResponseBody<any>,
  next: () => void
) {
  try {
    if (!req.body.isAuth) next();

    const [error, exists] = await checkBucketExistUtils(
      req.body.tenant.bucket.name
    );

    if (error) throw error;

    if (!exists) {
      res.status(404);
      next();
    }

    req.body.tenant.bucket.exists = true;
    next();
  } catch (err) {
    res.status(500);
    return next();
  }
}
