import { ROLE_PRIORITY, UserRole } from '@secure-task/data';

export const hasRoleOrHigher = (
  userRole: UserRole,
  requiredRole: UserRole,
): boolean => {
  return ROLE_PRIORITY[userRole] >= ROLE_PRIORITY[requiredRole];
};

export const isElevatedRole = (role: UserRole): boolean =>
  role === UserRole.Owner || role === UserRole.Admin;

