import { Injectable } from '@angular/core';
import {
  AuditLogEntry,
  CreateTaskRequest,
  CreateUserRequest,
  TaskDto,
  TaskStatus,
  UserProfile,
} from '@secure-task/data';
import { BehaviorSubject, forkJoin, tap } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TaskStoreService {
  readonly tasks$ = new BehaviorSubject<TaskDto[]>([]);
  readonly users$ = new BehaviorSubject<UserProfile[]>([]);
  readonly auditLog$ = new BehaviorSubject<AuditLogEntry[]>([]);
  readonly loading$ = new BehaviorSubject<boolean>(false);

  constructor(private readonly api: ApiService) {}

  refreshAll() {
    this.loading$.next(true);
    forkJoin({
      tasks: this.api.fetchTasks(),
      users: this.api.fetchUsers(),
    })
      .pipe(
        tap(({ tasks, users }) => {
          this.tasks$.next(tasks.tasks);
          this.users$.next(users.users);
          this.loading$.next(false);
        }),
      )
      .subscribe({
        error: () => this.loading$.next(false),
      });

    this.api.fetchAuditLog().subscribe({
      next: ({ entries }) => this.auditLog$.next(entries),
      error: () => this.auditLog$.next([]),
    });
  }

  createTask(payload: CreateTaskRequest) {
    return this.api.createTask(payload).pipe(
      tap(({ task }) => {
        this.tasks$.next([task, ...this.tasks$.value]);
      }),
    );
  }

  updateTask(taskId: string, payload: Partial<CreateTaskRequest>) {
    return this.api.updateTask(taskId, payload).pipe(
      tap(({ task }) => {
        this.tasks$.next(
          this.tasks$.value.map((existing) =>
            existing.id === task.id ? task : existing,
          ),
        );
      }),
    );
  }

  moveTask(taskId: string, status: TaskStatus) {
    return this.updateTask(taskId, { status });
  }

  deleteTask(taskId: string) {
    return this.api.deleteTask(taskId).pipe(
      tap(() =>
        this.tasks$.next(
          this.tasks$.value.filter((task) => task.id !== taskId),
        ),
      ),
    );
  }

  createUser(payload: CreateUserRequest) {
    return this.api.createUser(payload).pipe(
      tap(() => this.refreshUsers()),
    );
  }

  refreshUsers() {
    this.api.fetchUsers().subscribe(({ users }) => this.users$.next(users));
  }
}

