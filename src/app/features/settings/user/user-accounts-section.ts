import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader, lucideCheck, lucideLink, lucideUnlink } from '@ng-icons/lucide';
import { remixGoogleFill, remixMicrosoftFill } from '@ng-icons/remixicon';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { AuthService } from '../../../core/auth/auth.service';
import { OAuthService } from '../../../core/auth/oauth.service';

const ALL_PROVIDERS = ['Google', 'Microsoft'] as const;
type Provider = (typeof ALL_PROVIDERS)[number];

const PROVIDER_META: Record<Provider, { icon: string; label: string }> = {
  Google:    { icon: 'remixGoogleFill',    label: 'Google' },
  Microsoft: { icon: 'remixMicrosoftFill', label: 'Microsoft' },
};

@Component({
  selector: 'user-accounts-section',
  imports: [HlmButtonImports, HlmIcon, NgIcon, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideLoader, lucideCheck, lucideLink, lucideUnlink, remixGoogleFill, remixMicrosoftFill })],
  template: `
    <ul class="flex flex-col gap-2" role="list">
      @for (provider of allProviders; track provider) {
        @let login = connectedLogin(provider);
        @let busy = busyProvider() === provider;
        <li class="flex items-center justify-between gap-3 rounded-md border px-3 py-3">
          <div class="flex items-center gap-3">
            <ng-icon hlm [name]="providerIcon(provider)" size="sm" />
            <div class="flex flex-col">
              <span class="text-sm font-medium">{{ providerLabel(provider) }}</span>
              <span class="text-xs text-muted-foreground">
                @if (login) {
                  {{ 'user.accounts.connected' | transloco }}
                } @else {
                  {{ 'user.accounts.notConnected' | transloco }}
                }
              </span>
            </div>
          </div>

          @if (login) {
            <button hlmBtn variant="ghost" size="sm"
              [disabled]="!!busyProvider() || !canDisconnect()"
              [title]="!canDisconnect() ? ('user.accounts.cannotDisconnect' | transloco) : ''"
              [attr.aria-label]="'user.accounts.disconnect' | transloco: { provider: providerLabel(provider) }"
              (click)="removeLogin(login.id, provider)">
              @if (busy) {
                <ng-icon hlm name="lucideLoader" size="sm" class="animate-spin" />
              } @else {
                {{ 'user.accounts.disconnect' | transloco }}
              }
            </button>
          } @else {
            <button hlmBtn variant="outline" size="sm"
              [disabled]="!!busyProvider()"
              [attr.aria-label]="'user.accounts.connect' | transloco: { provider: providerLabel(provider) }"
              (click)="linkProvider(provider)">
              @if (busy) {
                <ng-icon hlm name="lucideLoader" size="sm" class="animate-spin" />
              } @else {
                {{ 'user.accounts.connect' | transloco: { provider: providerLabel(provider) } }}
              }
            </button>
          }
        </li>
      }
    </ul>

    @if (error()) {
      <p class="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{{ error() }}</p>
    }
  `,
})
export class UserAccountsSection implements OnInit {
  private readonly _auth = inject(AuthService);
  private readonly _oauth = inject(OAuthService);
  private readonly _t = inject(TranslocoService);

  protected readonly allProviders = ALL_PROVIDERS;

  protected readonly externalLogins = computed(() => this._auth.currentUser()?.externalLogins ?? []);
  protected readonly busyProvider = signal<Provider | null>(null);
  protected readonly error = signal<string | null>(null);

  // Відключення можливе якщо є пароль АБО більше одного зовнішнього логіну
  protected readonly canDisconnect = computed(() => {
    const user = this._auth.currentUser();
    return (user?.hasPassword ?? false) || this.externalLogins().length > 1;
  });

  ngOnInit(): void {
    // Підтягуємо актуальний стан (на випадку якщо localStorage застарів)
    this._auth.fetchCurrentUser().subscribe({ error: () => {} });
  }

  protected connectedLogin(provider: Provider) {
    return this.externalLogins().find(l => l.provider === provider) ?? null;
  }

  protected providerIcon(provider: Provider): string {
    return PROVIDER_META[provider].icon;
  }

  protected providerLabel(provider: Provider): string {
    return PROVIDER_META[provider].label;
  }

  removeLogin(loginId: string, provider: Provider): void {
    this.busyProvider.set(provider);
    this.error.set(null);
    this._auth.removeExternalLogin(loginId).subscribe({
      next: () => this.busyProvider.set(null),
      error: () => {
        this.error.set(this._t.translate('user.accounts.error'));
        this.busyProvider.set(null);
      },
    });
  }

  linkProvider(provider: Provider): void {
    this.busyProvider.set(provider);
    this.error.set(null);

    const link$ = provider === 'Microsoft'
      ? this._oauth.linkWithMicrosoft()
      : this._oauth.linkWithGoogle();

    link$.then(
      () => this.busyProvider.set(null),
    ).catch(() => {
      this.error.set(this._t.translate('user.accounts.error'));
      this.busyProvider.set(null);
    });
  }
}
