import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideGalleryVerticalEnd } from '@ng-icons/lucide';
import { LogoComponent } from '../../shared/logo';
import { LanguageSwitcher } from '../../shared/language-switcher/language-switcher';

@Component({
  selector: 'auth-layout',
  imports: [RouterOutlet, LogoComponent, LanguageSwitcher],
  providers: [provideIcons({ lucideGalleryVerticalEnd })],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  template: `
    <div class="grid min-h-svh lg:grid-cols-2">
      <div class="flex flex-col gap-4 p-6 md:p-10">
        <div class="flex items-center justify-between">
          <logo />
          <language-switcher />
        </div>
        <div class="flex flex-1 items-center justify-center">
          <div class="w-full max-w-xs">
            <router-outlet />
          </div>
        </div>
      </div>
      <div class="bg-muted relative hidden lg:block">
        <img
          src="space.jpg"
          alt="Image"
          class="absolute inset-0 h-full w-full object-cover brightness-[0.6]"
        />
      </div>
    </div>
  `,
})
export default class AuthLayoutComponent {}
