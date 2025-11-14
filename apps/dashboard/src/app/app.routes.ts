import { Route } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { TaskBoardComponent } from './features/task-board/task-board.component';
import { AuthGuard } from './core/auth.guard';

export const appRoutes: Route[] = [
  { path: 'login', component: LoginComponent },
  {
    path: 'tasks',
    component: TaskBoardComponent,
    canActivate: [AuthGuard],
  },
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  { path: '**', redirectTo: 'tasks' },
];
