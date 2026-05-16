import { ChangeDetectionStrategy, Component, inject, input, OnChanges, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { CategoryCreateDto, CategoryShortDto } from '../../api/event-schedule/models/category';
import { CategoryColorPickerComponent, CATEGORY_PRESET_COLORS } from './category-color-picker.component';
import { CategoryIconPickerComponent } from './category-icon-picker.component';

@Component({
  selector: 'app-category-edit-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, HlmDialogImports, HlmButtonImports, HlmInputImports, HlmLabelImports,
    CategoryColorPickerComponent, CategoryIconPickerComponent,
  ],
  template: `
    <hlm-dialog
      [state]="open() ? 'open' : 'closed'"
      closeOnBackdropClick
      (stateChanged)="onStateChanged($event)"
    >
      <hlm-dialog-content *hlmDialogPortal
        class="bg-[var(--surface)] border-[var(--ns-border)] text-[var(--fg)] max-w-md"
        aria-labelledby="dialog-title"
      >
        <hlm-dialog-header>
          <h2 id="dialog-title" hlmDialogTitle class="text-[var(--fg)]">
            {{ existing() ? 'Редагувати категорію' : 'Нова категорія' }}
          </h2>
        </hlm-dialog-header>

        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4 mt-4">

          <!-- Name -->
          <div class="flex flex-col gap-1">
            <label hlmLabel for="cat-title">Назва</label>
            <input hlmInput id="cat-title" formControlName="title" placeholder="Назва категорії"
                   class="bg-[var(--surface2)] border-[var(--ns-border)]" />
            @if (form.controls.title.invalid && form.controls.title.touched) {
              <span class="text-xs text-[var(--danger)]" role="alert">Назва обов'язкова</span>
            }
          </div>

          <!-- Description -->
          <div class="flex flex-col gap-1">
            <label hlmLabel for="cat-desc">Опис</label>
            <input hlmInput id="cat-desc" formControlName="description" placeholder="Опис (необов'язково)"
                   class="bg-[var(--surface2)] border-[var(--ns-border)]" />
          </div>

          <!-- Color -->
          <div class="flex flex-col gap-2">
            <label hlmLabel>Колір</label>
            <app-category-color-picker
              [value]="form.controls.color.value"
              (valueChange)="form.controls.color.setValue($event)"
            />
          </div>

          <!-- Icon -->
          <app-category-icon-picker
            [value]="form.controls.icon.value"
            [color]="form.controls.color.value"
            (valueChange)="form.controls.icon.setValue($event)"
          />

          <hlm-dialog-footer class="mt-2">
            <button type="button" hlmBtn variant="ghost"
                    class="text-[var(--fg-muted)]"
                    (click)="openChange.emit(false)">
              Скасувати
            </button>
            <button type="submit" hlmBtn
                    [disabled]="form.invalid"
                    class="bg-[var(--accent-color)] text-black hover:opacity-90">
              {{ existing() ? 'Зберегти' : 'Створити' }}
            </button>
          </hlm-dialog-footer>
        </form>
      </hlm-dialog-content>
    </hlm-dialog>
  `,
})
export class CategoryEditDialogComponent implements OnChanges {
  readonly open       = input<boolean>(false);
  readonly existing   = input<CategoryShortDto | null>(null);
  readonly openChange = output<boolean>();
  readonly saved      = output<CategoryCreateDto>();

  protected onStateChanged(state: BrnDialogState): void {
    if (state === 'closed') this.openChange.emit(false);
  }

  private readonly _fb = inject(FormBuilder);

  protected readonly form = this._fb.nonNullable.group({
    title:       ['', Validators.required],
    description: [''],
    color:       [CATEGORY_PRESET_COLORS[0]],
    icon:        ['remixStackLine'],
  });

  ngOnChanges(): void {
    const ex = this.existing();
    if (ex) {
      this.form.setValue({
        title:       ex.title,
        description: ex.description,
        color:       ex.color,
        icon:        ex.icon,
      });
    } else {
      this.form.reset({ title: '', description: '', color: CATEGORY_PRESET_COLORS[0], icon: 'remixStackLine' });
    }
  }

  protected submit(): void {
    if (this.form.invalid) return;
    this.saved.emit(this.form.getRawValue() as CategoryCreateDto);
    this.openChange.emit(false);
  }
}
