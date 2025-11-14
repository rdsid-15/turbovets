import {
  AuditLogEntry,
  OrganizationDto,
  TaskDto,
  UserProfile,
} from '@secure-task/data';
import { Organization } from '../organizations/entities/organization.entity';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';

export const toOrganizationDto = (org: Organization): OrganizationDto => ({
  id: org.id,
  name: org.name,
  parentId: org.parent?.id ?? null,
  createdAt: org.createdAt.toISOString(),
  updatedAt: org.updatedAt.toISOString(),
});

export const toUserProfile = (user: User): UserProfile => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  role: user.role,
  organization: toOrganizationDto(user.organization),
  lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
  createdAt: user.createdAt.toISOString(),
});

export const toTaskDto = (task: Task): TaskDto => ({
  id: task.id,
  title: task.title,
  description: task.description ?? undefined,
  status: task.status,
  category: task.category,
  dueDate: task.dueDate ? task.dueDate.toISOString() : null,
  organizationId: task.organization.id,
  createdById: task.createdBy?.id ?? '',
  assigneeId: task.assignee?.id ?? null,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});

export const toAuditEntry = (entry: AuditLog): AuditLogEntry => ({
  id: entry.id,
  actorId: entry.actor?.id ?? 'system',
  organizationId: entry.organization.id,
  action: entry.action,
  context: entry.context ?? {},
  createdAt: entry.createdAt.toISOString(),
});

