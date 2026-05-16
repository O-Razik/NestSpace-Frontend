import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notification',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none',
    'aria-live': 'polite',
    'aria-atomic': 'false',
  },
  template: `
    @for (toast of notifService.toasts(); track toast.id) {
      <div
        role="alert"
        class="pointer-events-auto flex items-center gap-3 rounded-[var(--ns-radius)] border px-4 py-3 text-sm shadow-lg"
        [class]="toastClass(toast.type)"
      >
        <span class="flex-1">{{ toast.message }}</span>
        <button
          type="button"
          aria-label="Dismiss"
          class="opacity-60 hover:opacity-100 transition-opacity"
          (click)="notifService.dismiss(toast.id)"
        >✕</button>
      </div>
    }
  `,
})
export class NotificationComponent {
  protected readonly notifService = inject(NotificationService);

  protected toastClass(type: 'success' | 'error' | 'warn'): string {
    const base = 'bg-[var(--surface2)]';
    if (type === 'error') return `${base} border-[var(--danger)] text-[var(--danger)]`;
    if (type === 'warn')  return `${base} border-[var(--warn)] text-[var(--warn)]`;
    return `${base} border-[var(--accent-color)] text-[var(--accent-color)]`;
  }
}
