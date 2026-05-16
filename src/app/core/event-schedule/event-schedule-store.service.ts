import { inject, Injectable, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';
import { CategoryStoreService } from './category-store.service';
import { ScheduleStoreService } from './schedule-store.service';

/**
 * Coordinator: orchestrates parallel loading for a space.
 * Individual data and CRUD live in CategoryStoreService / ScheduleStoreService.
 */
@Injectable({ providedIn: 'root' })
export class EventScheduleStoreService {
  readonly categoryStore = inject(CategoryStoreService);
  readonly scheduleStore = inject(ScheduleStoreService);

  private readonly _currentSpaceId = signal<string | null>(null);
  private readonly _loading        = signal(false);
  private readonly _error          = signal<string | null>(null);

  readonly isLoading = this._loading.asReadonly();
  readonly error     = this._error.asReadonly();

  loadForSpace(spaceId: string): void {
    if (this._currentSpaceId() === spaceId) return;
    this._currentSpaceId.set(spaceId);
    this._loading.set(true);
    this._error.set(null);

    forkJoin([
      this.categoryStore.load(spaceId).pipe(catchError(() => of(void 0))),
      this.scheduleStore.load(spaceId).pipe(catchError(() => of(void 0))),
    ]).subscribe({
      next:  () => this._loading.set(false),
      error: err => {
        this._error.set(err?.message ?? 'Failed to load');
        this._loading.set(false);
      },
    });
  }

  resetForSpace(spaceId: string): void {
    this._currentSpaceId.set(null);
    this.categoryStore.reset();
    this.scheduleStore.reset();
    this.loadForSpace(spaceId);
  }
}
