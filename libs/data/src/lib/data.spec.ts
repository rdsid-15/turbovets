import { UserRole, TaskStatus } from './enums';

describe('data enums', () => {
  it('should expose expected user roles', () => {
    expect(Object.values(UserRole)).toContain('owner');
  });

  it('should expose task statuses', () => {
    expect(Object.values(TaskStatus)).toContain('backlog');
  });
});
