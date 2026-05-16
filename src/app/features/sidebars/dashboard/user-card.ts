import { ChangeDetectionStrategy, Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { UserSettingsDialog } from '../../settings/user/user-settings-dialog';
import { AvatarComponent } from '../../../shared/ui/avatar';

@Component({
  selector: 'user-card',
  imports: [UserSettingsDialog, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="flex items-center gap-3 p-1">
      <app-avatar
        class="size-10 shrink-0 rounded-full bg-gradient-to-br from-accent to-accent-2
               text-sm font-bold text-primary-foreground"
        [src]="user()?.avatarUrl"
        [alt]="user()?.username ?? ''"
        [attr.aria-label]="user()?.username"
      />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold">{{ user()?.username }}</p>
        <div class="flex items-center gap-1">
          <div class="size-2 shrink-0 rounded-full bg-ok" aria-hidden="true"></div>
          <span class="truncate text-xs text-muted-foreground">{{ user()?.email }}</span>
        </div>
      </div>
      <user-settings-dialog />
    </div>
  `,
})
export class UserCard {
  private readonly _auth = inject(AuthService);

  protected readonly user = this._auth.currentUser;

}
