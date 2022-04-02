import { Permission } from '../../definitions/auth';
import { RequestBody } from '../../definitions/root';
import { hasPermission } from './hasPermission';

type Resolve =
  | [boolean, undefined]
  | [boolean, { __typename: string; message: string }];

export function resolveAuth(
  req: RequestBody,
  permission?: Permission
): Resolve {
  if (!req.body.isAuth) {
    return [
      false,
      {
        __typename: 'Unauthenticated',
        message: 'Error: user must be logged in',
      },
    ];
  }

  if (!req.body.tenant.bucket.exists) {
    return [
      false,
      {
        __typename: 'StorageNotFound',
        message: `Error: storage '${req.body.tenant}' could not be found`,
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
