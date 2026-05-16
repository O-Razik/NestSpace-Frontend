import { Routes } from '@angular/router';
import AuthLayoutComponent from './layout/auth/auth-layout';
import { LoginForm } from './features/auth/login-form';
import { SignupForm } from './features/auth/signup-form';
import { ForgotPasswordForm } from './features/auth/forgot-password-form';
import MainLayoutComponent from './layout/main/main-layout';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      { path: 'login', component: LoginForm },
      { path: 'forgot-password', component: ForgotPasswordForm },
      { path: 'register', component: SignupForm },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'space/:spaceId',
        loadComponent: () => import('./layout/main/space-layout').then(m => m.SpaceLayout),
        children: [
          { path: 'categories', loadComponent: () => import('./features/categories/categories-page.component') },
          { path: 'calendar',   loadComponent: () => import('./features/calendar/calendar-page.component') },
          { path: 'schedule',   loadComponent: () => import('./features/schedule/schedule-page.component') },
        ],
      },
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./layout/main/dashboard-layout').then(m => m.DashboardLayout),
      },
    ],
  },
];
