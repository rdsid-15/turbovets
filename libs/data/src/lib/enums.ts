export enum UserRole {
  Owner = 'owner',
  Admin = 'admin',
  Viewer = 'viewer',
}

export const ROLE_PRIORITY: Record<UserRole, number> = {
  [UserRole.Owner]: 3,
  [UserRole.Admin]: 2,
  [UserRole.Viewer]: 1,
};

export enum TaskStatus {
  Backlog = 'backlog',
  InProgress = 'in_progress',
  Review = 'review',
  Done = 'done',
}

export enum TaskCategory {
  Work = 'work',
  Personal = 'personal',
  Security = 'security',
  Other = 'other',
}

export enum AuditAction {
  Login = 'login',
  Logout = 'logout',
  CreateTask = 'create_task',
  UpdateTask = 'update_task',
  DeleteTask = 'delete_task',
  CreateUser = 'create_user',
  UpdateUser = 'update_user',
  ChangeRole = 'change_role',
  AccessDenied = 'access_denied',
}

