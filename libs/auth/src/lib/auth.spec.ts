import { hasRoleOrHigher } from './auth-role.utils';
import { UserRole } from '@secure-task/data';

describe('auth utils', () => {
  it('should compare roles by priority', () => {
    expect(hasRoleOrHigher(UserRole.Owner, UserRole.Admin)).toBe(true);
    expect(hasRoleOrHigher(UserRole.Viewer, UserRole.Admin)).toBe(false);
  });
});
