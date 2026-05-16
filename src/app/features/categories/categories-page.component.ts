import {
  ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  remixStackLine, remixRepeatLine, remixCalendarCheckLine,
  remixCheckboxLine, remixStickyNoteLine, remixAddLine,
} from '@ng-icons/remixicon';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { EventScheduleStoreService } from '../../core/event-schedule/event-schedule-store.service';
import { CategoryStoreService } from '../../core/event-schedule/category-store.service';
import { ScheduleStoreService } from '../../core/event-schedule/schedule-store.service';
import { SpaceService } from '../../core/space/space.service';
import { NotificationService } from '../../shared/notification/notification.service';
import { CategoryEditDialogComponent } from './category-edit-dialog.component';
import { CategoryPillBarComponent } from './category-pill-bar.component';
import { CategoryColumnComponent } from './category-column.component';
import { CategoryCreateDto, CategoryShortDto } from '../../api/event-schedule/models/category';

@Component({
  selector: 'app-categories-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIcon, HlmButtonImports,
    CategoryEditDialogComponent, CategoryPillBarComponent, CategoryColumnComponent,
  ],
  viewProviders: [provideIcons({
    remixStackLine, remixRepeatLine, remixCalendarCheckLine,
    remixCheckboxLine, remixStickyNoteLine, remixAddLine,
  })],
  host: { class: 'flex flex-col h-full bg-[var(--bg)]' },
  template: `
    <!-- Topbar -->
    <header class="flex items-center gap-2 px-4 py-3 border-b border-[var(--ns-border)] shrink-0">
      <ng-icon name="remixStackLine" size="18" class="text-[var(--accent-color)]" aria-hidden="true" />
      <h1 class="text-sm font-semibold text-[var(--fg)]">Категорії</h1>
      <button hlmBtn size="sm"
              class="ml-auto bg-[var(--accent-color)] text-black hover:opacity-90 text-xs"
              (click)="openNewEventDialog()">
        <ng-icon name="remixAddLine" size="14" aria-hidden="true" />
        Подія
      </button>
    </header>

    <!-- Pill carousel -->
    <app-category-pill-bar
      [categories]="categoryStore.categories()"
      [selectedId]="selectedCategoryId()"
      [loading]="store.isLoading()"
      (select)="selectedCategoryId.set($event)"
      (create)="openCreateDialog()"
    />

    <!-- 2×2 content grid -->
    <main class="grid grid-cols-2 flex-1 overflow-hidden [&>*+*]:border-l [&>*+*]:border-[var(--ns-border)]" aria-label="Події категорії">
      <section aria-labelledby="col-schedule">
        <app-category-column
          title="Розклад"
          titleId="col-schedule"
          icon="remixRepeatLine"
          [category]="selectedCategory() ?? null"
          [count]="regularEvents().length"
          [events]="regularEvents()"
          [loading]="store.isLoading()"
          emptyText="Немає регулярних подій"
        />
      </section>

      <section aria-labelledby="col-calendar">
        <app-category-column
          title="Календар"
          titleId="col-calendar"
          icon="remixCalendarCheckLine"
          [category]="selectedCategory() ?? null"
          [count]="soloEvents().length"
          [events]="soloEvents()"
          [loading]="store.isLoading()"
          emptyText="Немає разових подій"
        />
      </section>

      <section class="border-t border-[var(--ns-border)]" aria-labelledby="col-tasks">
        <app-category-column
          title="Завдання"
          titleId="col-tasks"
          icon="remixCheckboxLine"
          [category]="selectedCategory() ?? null"
          [count]="0"
          emptyText="Скоро"
        />
      </section>

      <section class="border-t border-[var(--ns-border)]" aria-labelledby="col-notes">
        <app-category-column
          title="Нотатки"
          titleId="col-notes"
          icon="remixStickyNoteLine"
          [category]="selectedCategory() ?? null"
          [count]="0"
          emptyText="Скоро"
        />
      </section>
    </main>

    <!-- Create/edit dialog -->
    <app-category-edit-dialog
      [open]="dialogOpen()"
      [existing]="editingCategory()"
      (openChange)="dialogOpen.set($event)"
      (saved)="onCategorySaved($event)"
    />
  `,
})
export default class CategoriesPageComponent implements OnInit {
  protected readonly store         = inject(EventScheduleStoreService);
  protected readonly categoryStore = inject(CategoryStoreService);
  protected readonly scheduleStore = inject(ScheduleStoreService);
  private readonly   _notif        = inject(NotificationService);
  private readonly   _spaceService = inject(SpaceService);

  protected readonly selectedCategoryId = signal<string | null>(null);
  protected readonly dialogOpen         = signal(false);
  protected readonly editingCategory    = signal<CategoryShortDto | null>(null);

  protected readonly selectedCategory = computed(() =>
    this.categoryStore.categories().find(c => c.id === this.selectedCategoryId()),
  );

  protected readonly regularEvents = computed(() => {
    const catId = this.selectedCategoryId();
    if (!catId) return [];
    return this.scheduleStore.regularEvents().filter(e => e.categoryId === catId);
  });

  protected readonly soloEvents = computed(() => {
    const catId = this.selectedCategoryId();
    if (!catId) return [];
    return this.scheduleStore.soloEvents().filter(e => e.categoryId === catId);
  });

  constructor() {
    effect(() => {
      const id = this._spaceService.selectedSpaceId();
      if (id) this.store.loadForSpace(id);
    });

    effect(() => {
      const cats = this.categoryStore.categories();
      if (cats.length && !this.selectedCategoryId()) {
        this.selectedCategoryId.set(cats[0].id);
      }
    });
  }

  ngOnInit(): void {}

  protected openCreateDialog(): void {
    this.editingCategory.set(null);
    this.dialogOpen.set(true);
  }

  protected openNewEventDialog(): void {}

  protected onCategorySaved(dto: CategoryCreateDto): void {
    const spaceId = this._spaceService.selectedSpaceId();
    const existing = this.editingCategory();

    if (!spaceId) return;

    if (existing) {
      this.categoryStore.updateCategory({ ...existing, ...dto }).subscribe({
        error: () => this._notif.show('Помилка при оновленні категорії', 'error'),
      });
    } else {
      this.categoryStore.createCategory(spaceId, { ...dto, spaceId }).subscribe({
        next: created => this.selectedCategoryId.set(created.id),
        error: () => this._notif.show('Помилка при створенні категорії', 'error'),
      });
    }
  }
}
