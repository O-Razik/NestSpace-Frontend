import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Reusable avatar component.
 * - Normalizes relative URLs (/avatars/...) to go through the API gateway.
 * - Falls back to initials when there is no src or when the image fails to load (error handler).
 * - Supports bgColor for colored initials backgrounds (e.g. members panel).
 */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (resolvedSrc() && !_imgError()) {
      <img
        [src]="resolvedSrc()!"
        [alt]="alt()"
        class="h-full w-full object-cover"
        (error)="_imgError.set(true)" />
    } @else {
      <span aria-hidden="true">{{ initials() }}</span>
    }
  `,
  host: {
    class: 'flex items-center justify-center overflow-hidden',
    '[style.background-color]': 'showBg() ? bgColor() : null',
  },
})
export class AvatarComponent {
  /** Raw avatar URL (relative or absolute). Null/undefined → show initials. */
  readonly src = input<string | null | undefined>(null);
  /** Alt text for the image (usually the user/space name). */
  readonly alt = input('');
  /** Fallback initials shown when there is no image. Defaults to first 2 chars of alt. */
  readonly fallback = input<string | null>(null);
  /** Background color applied when showing initials (no image). */
  readonly bgColor = input<string | null>(null);

  protected readonly _imgError = signal(false);

  protected readonly resolvedSrc = computed(() => {
    const src = this.src();
    if (!src) return null;
    return src.startsWith('/') ? `${environment.apiUrl}${src}` : src;
  });

  constructor() {
    // Reset error whenever src changes so new image gets a fresh attempt
    effect(() => {
      this.src();
      this._imgError.set(false);
    });
  }

  protected readonly showBg = computed(() => !this.resolvedSrc() || this._imgError());

  protected readonly initials = computed(() => {
    const fb = this.fallback();
    if (fb) return fb;
    return (this.alt() ?? '').slice(0, 2).toUpperCase();
  });
}
