import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from '@angular/core';
import { ControlContainer, FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideSearch, lucideX } from '@ng-icons/lucide';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { AuthService } from '../../core/auth/auth.service';
import { UserDtoShort } from '../../core/auth/auth.models';
import { AvatarComponent } from '../ui/avatar';

@Component({
  selector: 'user-search-inline',
  imports: [FormsModule, HlmButtonImports, HlmInputImports, HlmIcon, NgIcon, TranslocoPipe, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({ lucideSearch, lucideCheck, lucideX }),
    { provide: ControlContainer, useValue: null },
  ],
  template: `
    <div class="flex flex-col gap-2">
      <!-- Selected chips -->
      @if (selected().length > 0) {
        <div class="flex flex-wrap gap-1.5">
          @for (user of selected(); track user.id) {
            <span class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {{ user.username }}
              <button
                type="button"
                class="rounded-full hover:bg-primary/20 p-0.5"
                (click)="removeSelected(user.id)"
                [attr.aria-label]="'userSearch.removeAriaLabel' | transloco: { username: user.username }">
                <ng-icon hlm name="lucideX" size="xs" />
              </button>
            </span>
          }
        </div>
      }

      <!-- Search input -->
      <div class="relative flex items-center">
        <ng-icon hlm name="lucideSearch" size="sm"
          class="absolute left-3 text-muted-foreground pointer-events-none" />
        <input
          hlmInput
          type="text"
          [placeholder]="'userSearch.placeholder' | transloco"
          class="pl-9 text-sm w-full"
          [ngModel]="query()"
          (ngModelChange)="onQueryChange($event)"
          [attr.aria-label]="'userSearch.inputAriaLabel' | transloco" />
        @if (query()) {
          <button hlmBtn variant="ghost" size="icon-sm"
            class="absolute right-1"
            type="button"
            (click)="clearQuery()"
            [attr.aria-label]="'userSearch.clearAriaLabel' | transloco">
            <ng-icon hlm name="lucideX" size="sm" />
          </button>
        }
      </div>

      <!-- Results -->
      @if (searching()) {
        <p class="text-xs text-muted-foreground px-1">{{ 'userSearch.searching' | transloco }}</p>
      } @else if (searchError()) {
        <p class="text-xs text-destructive px-1">{{ searchError() }}</p>
      } @else if (result()) {
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-accent transition-colors text-left"
          [class]="isSelected(result()!.id) ? 'bg-accent/60' : ''"
          (click)="toggleUser(result()!)"
          [attr.aria-pressed]="isSelected(result()!.id)">
          <app-avatar
            class="h-8 w-8 shrink-0 rounded-full bg-muted text-xs font-medium"
            [src]="result()!.avatarUrl"
            [alt]="result()!.username" />
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-medium truncate">{{ result()!.username }}</span>
            <span class="text-xs text-muted-foreground truncate">{{ result()!.email }}</span>
          </div>
          @if (isSelected(result()!.id)) {
            <ng-icon hlm name="lucideCheck" size="sm" class="ml-auto text-primary shrink-0" />
          }
        </button>
      } @else if (query().length >= 2) {
        <p class="text-xs text-muted-foreground px-1">{{ 'userSearch.notFound' | transloco }}</p>
      }
    </div>
  `,
})
export class UserSearchInline {
  private readonly _auth = inject(AuthService);
  private readonly _t = inject(TranslocoService);

  readonly selectionChange = output<UserDtoShort[]>();

  readonly query = signal('');
  readonly searching = signal(false);
  readonly result = signal<UserDtoShort | null>(null);
  readonly searchError = signal<string | null>(null);
  readonly selected = signal<UserDtoShort[]>([]);

  readonly isSelected = (id: string) => this.selected().some(u => u.id === id);

  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  onQueryChange(value: string): void {
    this.query.set(value);
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this.result.set(null);
    this.searchError.set(null);

    if (value.trim().length < 2) {
      this.searching.set(false);
      return;
    }

    this.searching.set(true);
    this._debounceTimer = setTimeout(() => this._search(value.trim()), 400);
  }

  private _search(value: string): void {
    const obs = value.includes('@')
      ? this._auth.searchByEmail(value)
      : this._auth.searchByUsername(value);

    obs.subscribe({
      next: user => {
        this.result.set(user);
        this.searching.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.result.set(null);
        this.searching.set(false);
        if (err.status !== 404) {
          this.searchError.set(err.error?.message ?? this._t.translate('userSearch.searchFailed'));
        }
      },
    });
  }

  toggleUser(user: UserDtoShort): void {
    if (this.isSelected(user.id)) {
      this.removeSelected(user.id);
    } else {
      this.selected.update(list => [...list, user]);
      this.clearQuery();
    }
    this.selectionChange.emit(this.selected());
  }

  removeSelected(id: string): void {
    this.selected.update(list => list.filter(u => u.id !== id));
    this.selectionChange.emit(this.selected());
  }

  clearQuery(): void {
    this.query.set('');
    this.result.set(null);
    this.searchError.set(null);
    this.searching.set(false);
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
  }

  reset(): void {
    this.selected.set([]);
    this.clearQuery();
  }
}
