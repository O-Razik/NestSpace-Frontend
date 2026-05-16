import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { UserDtoShort } from '../../core/auth/auth.models';
import { UserSearchInline } from './user-search-inline';

@Component({
  selector: 'user-search-dialog',
  imports: [HlmButtonImports, HlmDialogImports, UserSearchInline, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    <hlm-dialog #dialog closeOnBackdropClick>
      <hlm-dialog-content *hlmDialogPortal [showCloseButton]="false"
        class="flex flex-col p-0 gap-0 max-w-md w-full">

        <div class="px-4 py-3 border-b">
          <p class="text-sm font-medium">{{ 'userSearch.dialog.title' | transloco }}</p>
        </div>

        <div class="px-4 py-3 overflow-y-auto" style="max-height: 420px">
          <user-search-inline #search />
        </div>

        <div class="flex items-center justify-between border-t px-4 py-3">
          <span class="text-xs text-muted-foreground">
            @if (search.selected().length > 0) {
              {{ 'userSearch.dialog.selected' | transloco: { count: search.selected().length } }}
            }
          </span>
          <div class="flex gap-2">
            <button hlmBtn variant="outline" size="sm" hlmDialogClose>{{ 'userSearch.dialog.cancel' | transloco }}</button>
            <button hlmBtn size="sm"
              [disabled]="search.selected().length === 0"
              (click)="confirm()"
              hlmDialogClose>
              {{ confirmLabel() }}
            </button>
          </div>
        </div>

      </hlm-dialog-content>
    </hlm-dialog>
  `,
})
export class UserSearchDialog {
  private readonly _dialog = viewChild.required<HlmDialog>('dialog');
  private readonly _search = viewChild.required<UserSearchInline>('search');

  readonly confirmLabel = input('');
  readonly confirmed = output<UserDtoShort[]>();

  open(): void {
    this._dialog().open();
  }

  confirm(): void {
    this.confirmed.emit(this._search().selected());
    this._search().reset();
  }
}
