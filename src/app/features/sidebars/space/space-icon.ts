import { ChangeDetectionStrategy, Component, computed, effect, input, signal, ViewEncapsulation } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { NgIcon } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Badge } from '../../../shared/badge';
import { HlmHoverCardImports } from '@spartan-ng/helm/hover-card';

@Component({
  selector: 'space-icon',
  imports: [HlmButtonImports, NgIcon, HlmIcon, Badge, HlmHoverCardImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'relative flex justify-center group w-full' },
  template: `
    <div
      class="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white
                transition-all duration-200 h-0 opacity-0 group-hover:h-2 group-hover:opacity-100"
      [class.!h-5]="active()"
      [class.!opacity-100]="active()"
      aria-hidden="true"
    ></div>
    <hlm-hover-card>
      <button
        hlmBtn
        hlmHoverCardTrigger
        align="right"
        variant="ghost"
        size="icon-lg"
        class="border-2 border-gray-800 shadow-sm
            hover:border-3 hover:border-gray-600
            transition-all duration-200 ease-in-out"
        [class.rounded-full]="shape() === 'circle'"
        [class.rounded-xl]="shape() === 'rounded'"
        [class.p-0]="hasAvatar()"
        [class.overflow-hidden]="hasAvatar()"
        [class.p-4]="!hasAvatar()"
        [attr.aria-label]="label()"
      >
        @if (hasAvatar()) {
          <img [src]="resolvedAvatarUrl()!" [alt]="label()" class="h-full w-full object-cover"
            (error)="_imgError.set(true)" />
        } @else if (icon()) {
          <ng-icon hlm [name]="icon()" size="lg" />
        } @else {
          <span class="text-sm font-bold" aria-hidden="true">{{ initials() }}</span>
        }
        <badge [badge]="badge()" class="absolute -right-2 -bottom-0" />
      </button>
      <hlm-hover-card-content class="w-auto p-2" *hlmHoverCardPortal>
        <p class="text-sm font-semibold">{{ label() }}</p>
      </hlm-hover-card-content>
    </hlm-hover-card>
  `,
})
export class SpaceIconComponent {
  icon = input<string>('');
  label = input.required<string>();
  avatarUrl = input<string | null>(null);
  shape = input<'circle' | 'rounded'>('circle');
  active = input<boolean>(false);
  badge = input<number>(0);

  protected readonly _imgError = signal(false);

  protected readonly resolvedAvatarUrl = computed(() => {
    const url = this.avatarUrl();
    if (!url) return null;
    return url.startsWith('/') ? `${environment.apiUrl}${url}` : url;
  });

  constructor() {
    effect(() => {
      this.avatarUrl();
      this._imgError.set(false);
    });
  }

  protected readonly hasAvatar = computed(() => !!this.resolvedAvatarUrl() && !this._imgError());

  readonly initials = computed(() => this.label().trim().charAt(0).toUpperCase());
}
