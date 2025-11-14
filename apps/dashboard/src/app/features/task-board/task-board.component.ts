import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit, DestroyRef, signal, HostListener } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import {
  TaskCategory,
  TaskDto,
  TaskStatus,
  UserProfile,
  UserRole,
} from '@secure-task/data';
import { CreateTaskRequest, CreateUserRequest } from '@secure-task/data';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskStoreService } from '../../core/task-store.service';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';

interface BoardColumn {
  key: TaskStatus;
  label: string;
  hint: string;
}

type TaskFormGroup = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  category: FormControl<TaskCategory>;
  assigneeId: FormControl<string>;
  dueDate: FormControl<string>;
}>;

type UserFormGroup = FormGroup<{
  email: FormControl<string>;
  displayName: FormControl<string>;
  password: FormControl<string>;
  role: FormControl<UserRole>;
}>;

@Component({
  selector: 'app-task-board',
  standalone: false,
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.css'],
})
export class TaskBoardComponent implements OnInit {
  readonly TaskStatus = TaskStatus;
  readonly TaskCategory = TaskCategory;
  readonly UserRole = UserRole;

  readonly statusColumns: BoardColumn[] = [
    { key: TaskStatus.Backlog, label: 'Backlog', hint: 'Unprioritized work' },
    {
      key: TaskStatus.InProgress,
      label: 'In Progress',
      hint: 'Currently owned',
    },
    { key: TaskStatus.Review, label: 'Review', hint: 'Needs verification' },
    { key: TaskStatus.Done, label: 'Done', hint: 'Completed tasks' },
  ];

  readonly taskForm: TaskFormGroup;
  readonly userForm: UserFormGroup;

  get tasks$() {
    return this.taskStore.tasks$;
  }

  get users$() {
    return this.taskStore.users$;
  }

  get auditLog$() {
    return this.taskStore.auditLog$;
  }

  get loading$() {
    return this.taskStore.loading$;
  }

  get currentUser$() {
    return this.auth.user$;
  }

  hasManageRights = signal(false);

  currentUser: UserProfile | null = null;
  showShortcuts = signal(false);

  constructor(
    fb: NonNullableFormBuilder,
    private readonly taskStore: TaskStoreService,
    private readonly auth: AuthService,
    private readonly theme: ThemeService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.taskForm = fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: [TaskCategory.Work, Validators.required],
      assigneeId: [''],
      dueDate: [''],
    });

    this.userForm = fb.group({
      email: ['', [Validators.required, Validators.email]],
      displayName: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(10)]],
      role: [UserRole.Viewer, Validators.required],
    });
  }

  refreshData(): void {
    this.taskStore.refreshAll();
  }

  ngOnInit(): void {
    this.taskStore.refreshAll();
    this.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.currentUser = user;
        this.hasManageRights.set(
          !!user && user.role !== UserRole.Viewer,
        );
      });
  }

  tasksForStatus(status: TaskStatus, tasks: TaskDto[]): TaskDto[] {
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  createTask() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    const payload: CreateTaskRequest = this.taskForm.getRawValue();
    this.taskStore.createTask(payload).subscribe(() => {
      this.taskForm.reset({
        title: '',
        description: '',
        category: TaskCategory.Work,
        assigneeId: '',
        dueDate: '',
      });
    });
  }

  drop(event: CdkDragDrop<TaskDto[]>, status: TaskStatus) {
    const task = event.item.data as TaskDto;
    if (task.status === status) {
      return;
    }
    this.taskStore.moveTask(task.id, status).subscribe();
  }

  deleteTask(task: TaskDto) {
    this.taskStore.deleteTask(task.id).subscribe();
  }

  createUser() {
    const currentUser = this.currentUser;
    if (!currentUser || currentUser.role === UserRole.Viewer) {
      return;
    }
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    const payload: CreateUserRequest = {
      ...this.userForm.getRawValue(),
      organizationId: currentUser.organization.id,
    };
    this.taskStore.createUser(payload).subscribe(() => {
      this.userForm.reset({
        email: '',
        displayName: '',
        password: '',
        role: UserRole.Viewer,
      });
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    if (event.key === 't' || event.key === 'T') {
      if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        this.theme.toggleTheme();
        return;
      }
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      if (this.hasManageRights() && this.taskForm.valid) {
        this.createTask();
      } else {
        const titleInput = document.querySelector('input[formControlName="title"]') as HTMLInputElement;
        if (titleInput) {
          titleInput.focus();
        }
      }
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      event.preventDefault();
      this.refreshData();
      return;
    }

    if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.showShortcuts.set(!this.showShortcuts());
      return;
    }

    if (event.key === 'Escape') {
      this.showShortcuts.set(false);
      return;
    }
  }
  getTaskStats(tasks: TaskDto[]) {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === TaskStatus.Done).length;
    const inProgress = tasks.filter((t) => t.status === TaskStatus.InProgress).length;
    const review = tasks.filter((t) => t.status === TaskStatus.Review).length;
    const backlog = tasks.filter((t) => t.status === TaskStatus.Backlog).length;

    return {
      total,
      done,
      inProgress,
      review,
      backlog,
      completionPercentage: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }

  getStatusCount(tasks: TaskDto[], status: TaskStatus): number {
    return tasks.filter((t) => t.status === status).length;
  }

  getStatusPercentage(tasks: TaskDto[], status: TaskStatus): number {
    const total = tasks.length;
    if (total === 0) return 0;
    return Math.round((this.getStatusCount(tasks, status) / total) * 100);
  }
}

