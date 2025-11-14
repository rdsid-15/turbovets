import { TaskCategory, TaskStatus, UserRole } from './enums';
import { TaskDto, UserProfile, AuditLogEntry, OrganizationDto } from './models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  organizationId: string;
}

export interface InviteUserRequest {
  email: string;
  displayName: string;
  role: UserRole;
  organizationId: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
  dueDate?: string | null;
  assigneeId?: string | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
  dueDate?: string | null;
  assigneeId?: string | null;
}

export interface TaskListResponse {
  tasks: TaskDto[];
}

export interface TaskDetailResponse {
  task: TaskDto;
}

export interface UserListResponse {
  users: UserProfile[];
}

export interface OrganizationListResponse {
  organizations: OrganizationDto[];
}

export interface AuditLogResponse {
  entries: AuditLogEntry[];
}

