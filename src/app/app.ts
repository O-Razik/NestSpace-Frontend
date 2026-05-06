import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import LoginTwoColumnReactiveFormPage from './layout/auth/auth-layout';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('NestSpace');
}
