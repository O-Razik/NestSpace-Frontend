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
    pathMatch: 'full',
  },
];
