import { Permission } from '../../definitions/auth';
import { RequestBody } from '../../definitions/root';
import { GqlError } from '../../definitions/types';
import hasPermission from './hasPermission';

export default function resolveAuth(
  req: RequestBody,
  permission?: Permission
): [boolean, undefined] | [boolean, GqlError] {
  if (!req.body.isAuth) {
    return [
      false,
      {
        __typename: 'Unauthenticated',
        message: 'Error: user must be logged in',
      },
    ];
  }

  if (permission && !hasPermission(req, permission)) {
    return [
      false,
      {
        __typename: 'Unauthorized',
        message:
          'Error: user does not have the required permission to perform this action (ಠ_ಠ)',
      },
    ];
  }

  return [true, undefined];
}
