import { Permission } from '../../definitions/auth';
import { RequestBody } from '../../definitions/root';

export default function hasPermission(
  req: RequestBody,
  permission: Permission
): boolean {
  return req.body.permissions.includes(permission);
}
