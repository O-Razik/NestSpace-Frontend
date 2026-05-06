import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink} from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideOrbit } from '@ng-icons/lucide';

@Component({
  selector: 'logo',
  imports: [RouterLink, NgIcon],
  providers: [provideIcons({ lucideOrbit })],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  template: `
    <div class="flex justify-center gap-2 md:justify-start">
      <a routerLink="/" class="flex items-center gap-2 font-medium">
        <div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
          <ng-icon name="lucideOrbit" class="text-base" />
        </div>
        NestSpace
      </a>
    </div>
  `,
})
export class LogoComponent {}
