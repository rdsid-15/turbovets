import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { User } from '../users/entities/user.entity';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  TaskCategory,
  TaskStatus,
  UserRole,
} from '@secure-task/data';
import { toTaskDto } from '../common/mappers';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepo: Repository<Task>,
    private readonly auditService: AuditService,
    private readonly usersService: UsersService,
  ) {}

  async listForUser(user: User) {
    const tasks = await this.tasksRepo.find({
      where: { organization: { id: user.organization.id } },
      order: { createdAt: 'DESC' },
    });
    return tasks.map(toTaskDto);
  }

  private ensureCanMutate(user: User) {
    if (user.role === UserRole.Viewer) {
      throw new ForbiddenException('Viewers cannot modify tasks');
    }
  }

  private async resolveAssignee(dto: CreateTaskDto | UpdateTaskDto, user: User) {
    if (!dto.assigneeId) {
      return null;
    }
    const assignee = await this.usersService.findById(dto.assigneeId);
    if (!assignee || assignee.organization.id !== user.organization.id) {
      throw new NotFoundException('Assignee not found in your organization');
    }
    return assignee;
  }

  async create(dto: CreateTaskDto, actor: User) {
    this.ensureCanMutate(actor);
    const assignee = await this.resolveAssignee(dto, actor);
    const task = this.tasksRepo.create({
      title: dto.title,
      description: dto.description,
      status: dto.status ?? TaskStatus.Backlog,
      category: dto.category ?? TaskCategory.Work,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      organization: actor.organization,
      createdBy: actor,
      assignee,
    });
    const saved = await this.tasksRepo.save(task);
    await this.auditService.logAction(actor, AuditAction.CreateTask, {
      taskId: saved.id,
    });
    return toTaskDto(saved);
  }

  private async getScopedTask(id: string, user: User) {
    const task = await this.tasksRepo.findOne({
      where: { id },
    });
    if (!task || task.organization.id !== user.organization.id) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, actor: User) {
    this.ensureCanMutate(actor);
    const task = await this.getScopedTask(id, actor);
    const assignee = await this.resolveAssignee(dto, actor);
    if (dto.title) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.status) task.status = dto.status;
    if (dto.category) task.category = dto.category;
    if (dto.dueDate !== undefined) {
      task.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }
    if (dto.assigneeId !== undefined) {
      task.assignee = assignee;
    }
    const saved = await this.tasksRepo.save(task);
    await this.auditService.logAction(actor, AuditAction.UpdateTask, {
      taskId: saved.id,
      status: saved.status,
    });
    return toTaskDto(saved);
  }

  async remove(id: string, actor: User) {
    this.ensureCanMutate(actor);
    const task = await this.getScopedTask(id, actor);
    await this.tasksRepo.remove(task);
    await this.auditService.logAction(actor, AuditAction.DeleteTask, {
      taskId: id,
    });
  }
}

