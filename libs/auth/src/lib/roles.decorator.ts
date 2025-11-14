import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@secure-task/data';

export const ROLES_KEY = 'roles';
export const RolesAllowed = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);

