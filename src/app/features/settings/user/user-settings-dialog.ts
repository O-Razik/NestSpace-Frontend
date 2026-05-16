import { ChangeDetectionStrategy, Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLogOut, lucideTrash2 } from '@ng-icons/lucide';
import { TranslocoPipe } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { AuthService } from '../../../core/auth/auth.service';
import { UniversalSettingsDialog } from '../../../shared/settings/universal-settings-dialog';
import { SettingsTabDirective } from '../../../shared/settings/settings-tab.directive';
import { LanguageSwitcher } from '../../../shared/language-switcher/language-switcher';
import { UserProfileSection } from './user-profile-section';
import { UserPasswordSection } from './user-password-section';
import { UserAccountsSection } from './user-accounts-section';

type ConfirmAction = 'logout' | 'delete' | null;

@Component({
  selector: 'user-settings-dialog',
  imports: [
    HlmButtonImports,
    HlmIcon,
    HlmInputImports,
    HlmSeparatorImports,
    NgIcon,
    TranslocoPipe,
    UniversalSettingsDialog,
    SettingsTabDirective,
    LanguageSwitcher,
    UserProfileSection,
    UserPasswordSection,
    UserAccountsSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [provideIcons({ lucideLogOut, lucideTrash2 })],
  host: { class: 'contents' },
  template: `
    <universal-settings-dialog
      [triggerLabel]="'settings.openSettings' | transloco"
      [allLabel]="'settings.all' | transloco">

      <!-- Confirmation overlay -->
      @if (confirmAction()) {
        <div dialogOverlay class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/95 backdrop-blur-sm p-6">
          @if (confirmAction() === 'logout') {
            <div class="flex flex-col items-center gap-4 text-center max-w-xs">
              <p class="font-semibold text-base">{{ 'user.dialog.logoutTitle' | transloco }}</p>
              <p class="text-sm text-muted-foreground">{{ 'user.dialog.logoutBody' | transloco }}</p>
              <div class="flex gap-2 w-full">
                <button hlmBtn variant="outline" class="flex-1" (click)="confirmAction.set(null)">{{ 'common.cancel' | transloco }}</button>
                <button hlmBtn class="flex-1" (click)="doLogout()">{{ 'user.dialog.logout' | transloco }}</button>
              </div>
            </div>
          } @else {
            <div class="flex flex-col items-center gap-4 text-center max-w-xs">
              <p class="font-semibold text-base text-destructive">{{ 'user.dialog.deleteTitle' | transloco }}</p>
              <p class="text-sm text-muted-foreground">
                {{ 'user.dialog.deleteBody' | transloco }}
                <code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">{{ user()?.username }}</code>
                {{ 'user.dialog.deleteBodySuffix' | transloco }}
              </p>
              <input hlmInput type="text"
                [placeholder]="user()?.username ?? ''"
                [value]="deleteConfirmInput()"
                (input)="deleteConfirmInput.set($any($event.target).value)"
                class="w-full"
                aria-label="Type your username to confirm deletion" />
              <div class="flex gap-2 w-full">
                <button hlmBtn variant="outline" class="flex-1"
                  (click)="confirmAction.set(null); deleteConfirmInput.set('')">{{ 'common.cancel' | transloco }}</button>
                <button hlmBtn variant="destructive" class="flex-1"
                  [disabled]="deleteConfirmInput() !== user()?.username || deleteLoading()"
                  (click)="doDelete()">
                  {{ (deleteLoading() ? 'user.dialog.deleting' : 'user.dialog.delete') | transloco }}
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Header actions: language switcher + logout -->
      <div headerActions class="flex items-center gap-1">
        <language-switcher />
        <button hlmBtn variant="destructive" size="sm"
          class="gap-1.5"
          type="button" (click)="confirmAction.set('logout')">
          <ng-icon hlm name="lucideLogOut" size="sm" />
          {{ 'user.dialog.logout' | transloco }}
        </button>
      </div>

      <!-- Tabs -->
      <ng-template settingsTab key="profile" [label]="'user.tabs.profile' | transloco">
        <user-profile-section />
      </ng-template>

      <ng-template settingsTab key="password" [label]="'user.tabs.password' | transloco">
        <user-password-section />
      </ng-template>

      <ng-template settingsTab key="accounts" [label]="'user.tabs.accounts' | transloco">
        <user-accounts-section />
      </ng-template>

      <!-- Danger zone — only visible in All mode, custom heading -->
      <ng-template settingsTab key="danger" [label]="'user.dialog.dangerZone' | transloco" [showInAllOnly]="true" [skipHeading]="true">
        <h3 class="mb-4 text-sm font-semibold text-destructive">{{ 'user.dialog.dangerZone' | transloco }}</h3>
        <button hlmBtn variant="destructive" type="button" class="w-full" (click)="confirmAction.set('delete')">
          <ng-icon hlm name="lucideTrash2" size="sm" class="mr-2" />
          {{ 'user.dialog.deleteAccount' | transloco }}
        </button>
      </ng-template>

    </universal-settings-dialog>
  `,
})
export class UserSettingsDialog {
  private readonly _auth = inject(AuthService);

  protected readonly user = this._auth.currentUser;

  readonly confirmAction = signal<ConfirmAction>(null);
  readonly deleteConfirmInput = signal('');
  readonly deleteLoading = signal(false);

  doLogout(): void {
    this._auth.logout();
  }

  doDelete(): void {
    if (this.deleteLoading()) return;
    this.deleteLoading.set(true);
    this._auth.deleteAccount().subscribe({
      error: () => this.deleteLoading.set(false),
    });
  }
}
