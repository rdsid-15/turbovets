import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  AuditLogResponse,
  CreateTaskRequest,
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  TaskDetailResponse,
  TaskListResponse,
  UserListResponse,
} from '@secure-task/data';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = '/api';

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload);
  }

  fetchTasks(): Observable<TaskListResponse> {
    return this.http.get<TaskListResponse>(`${this.baseUrl}/tasks`);
  }

  createTask(payload: CreateTaskRequest): Observable<TaskDetailResponse> {
    return this.http.post<TaskDetailResponse>(`${this.baseUrl}/tasks`, payload);
  }

  updateTask(
    id: string,
    payload: Partial<CreateTaskRequest>,
  ): Observable<TaskDetailResponse> {
    return this.http.put<TaskDetailResponse>(
      `${this.baseUrl}/tasks/${id}`,
      payload,
    );
  }

  deleteTask(id: string) {
    return this.http.delete(`${this.baseUrl}/tasks/${id}`);
  }

  fetchUsers(): Observable<UserListResponse> {
    return this.http.get<UserListResponse>(`${this.baseUrl}/users`);
  }

  createUser(payload: CreateUserRequest) {
    return this.http.post(`${this.baseUrl}/users`, payload);
  }

  fetchAuditLog(): Observable<AuditLogResponse> {
    return this.http.get<AuditLogResponse>(`${this.baseUrl}/audit-log`);
  }
}

