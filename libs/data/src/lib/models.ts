import { TaskCategory, TaskStatus, UserRole, AuditAction } from './enums';

export interface OrganizationDto {
  id: string;
  name: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  organization: OrganizationDto;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface TaskDto {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  category: TaskCategory;
  dueDate?: string | null;
  organizationId: string;
  createdById: string;
  assigneeId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  organizationId: string;
  action: AuditAction;
  context: Record<string, unknown>;
  createdAt: string;
}

