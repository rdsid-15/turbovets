import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/auth.service';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  constructor(
    private readonly auth: AuthService,
    private readonly theme: ThemeService,
  ) {}

  ngOnInit(): void {}

  get user$() {
    return this.auth.user$;
  }

  get currentTheme$() {
    return this.theme.currentTheme;
  }

  toggleTheme() {
    this.theme.toggleTheme();
  }

  logout() {
    this.auth.logout();
  }
}
