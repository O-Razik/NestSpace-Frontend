import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus } from '@ng-icons/lucide';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { SpaceService } from '../../core/space/space.service';
import { UserDtoShort } from '../../core/auth/auth.models';
import { UserSearchDialog } from '../../shared/user-search/user-search-dialog';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'space-add-member-dialog',
  imports: [HlmButtonImports, HlmIcon, NgIcon, UserSearchDialog, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [provideIcons({ lucideUserPlus })],
  host: { class: 'contents' },
  template: `
    <user-search-dialog #search
      [confirmLabel]="'space.addMember.confirmLabel' | transloco"
      (confirmed)="onConfirmed($event)" />
    <button hlmBtn variant="ghost" size="icon-sm"
      (click)="search.open()"
      [attr.aria-label]="'space.addMember.ariaLabel' | transloco">
      <ng-icon hlm name="lucideUserPlus" size="sm" />
    </button>
  `,
})
export class SpaceAddMemberDialog {
  private readonly _spaceService = inject(SpaceService);
  private readonly _t = inject(TranslocoService);

  readonly spaceId = input.required<string>();
  readonly addError = signal<string | null>(null);

  onConfirmed(users: UserDtoShort[]): void {
    if (!users.length) return;

    this._spaceService.getSpaceById(this.spaceId()).subscribe({
      next: spaceDto => {
        const memberRole = spaceDto.roles.find(r => r.name === 'Member') ?? spaceDto.roles[0];
        if (!memberRole) return;

        const adds = users.map(u =>
          this._spaceService
            .addSpaceMember(this.spaceId(), { userId: u.id, roleId: memberRole.id })
            .pipe(catchError(() => of(null))),
        );

        forkJoin(adds).subscribe();
      },
      error: (err: HttpErrorResponse) => {
        this.addError.set(err.error?.message ?? this._t.translate('space.addMember.errorLoad'));
      },
    });
  }
}
