import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, tap } from 'rxjs';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse, UserProfile } from '@secure-task/data';

interface StoredSession {
  token: string;
  user: UserProfile;
}

const SESSION_KEY = 'secure-task.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: string | null = null;
  private readonly userSubject = new BehaviorSubject<UserProfile | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor(
    private readonly api: ApiService,
    private readonly router: Router,
  ) {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) {
      try {
        const parsed = JSON.parse(existing) as StoredSession;
        this.token = parsed.token;
        this.userSubject.next(parsed.user);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  login(payload: LoginRequest) {
    return this.api.login(payload).pipe(
      tap((response) => this.persistSession(response)),
      map((response: LoginResponse) => response.user),
    );
  }

  private persistSession(response: LoginResponse) {
    this.token = response.token;
    this.userSubject.next(response.user);
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ token: response.token, user: response.user }),
    );
  }

  logout() {
    this.token = null;
    localStorage.removeItem(SESSION_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticatedSnapshot(): boolean {
    return !!this.userSubject.value;
  }
}

