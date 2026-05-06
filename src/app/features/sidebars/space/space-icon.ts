import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Badge } from '../../../shared/badge';

@Component({
  selector: 'space-icon',
  imports: [HlmButtonImports, NgIcon, HlmIcon, Badge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex justify-center' },
  template: `
    <button hlmBtn variant="ghost" size="icon-lg"
            class="relative border-2 border-gray-800 shadow-sm"
            [class.rounded-full]="shape() === 'circle'"
            [class.rounded-xl]="shape() === 'rounded'"
            [class.p-0]="!!avatarUrl()"
            [class.overflow-hidden]="!!avatarUrl()"
            [class.p-4]="!avatarUrl()"
            [class.active]="active()"
            [attr.aria-label]="label()">
      @if (avatarUrl()) {
        <img [src]="avatarUrl()" [alt]="label()" class="h-full w-full object-cover" />
      } @else if (icon()) {
        <ng-icon hlm [name]="icon()" size="lg" />
      } @else {
        <span class="text-sm font-bold" aria-hidden="true">{{ initials() }}</span>
      }
      <badge [badge]="badge()" class="absolute -right-2 -bottom-0" />
    </button>
  `,
})
export class SpaceIconComponent {
  icon = input<string>('');
  label = input.required<string>();
  avatarUrl = input<string | null>(null);
  shape = input<'circle' | 'rounded'>('circle');
  active = input<boolean>(false);
  badge = input<number>(0);

  readonly initials = computed(() =>
    this.label().trim().charAt(0).toUpperCase(),
  );
}