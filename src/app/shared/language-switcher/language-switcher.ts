import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LanguageService } from '../../core/language/language.service';

@Component({
  selector: 'language-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex p-[3px]' },
  template: `
    <div class="inline-grid grid-cols-2 bg-[var(--muted)] rounded-full p-[5px] gap-0.5" role="group" aria-label="Мова / Language">
      <button class="relative z-[1] px-3 py-[3px] border-0 bg-transparent rounded-full text-[0.7rem] font-semibold tracking-[0.04em] cursor-pointer text-[var(--muted-foreground)] transition-colors duration-150 leading-[1.4] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-1"
        [style.background]="lang() === 'uk' ? 'var(--background)' : null"
        [style.color]="lang() === 'uk' ? 'var(--foreground)' : null"
        [style.boxShadow]="lang() === 'uk' ? '0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.08)' : null"
        aria-label="Українська"
        [attr.aria-pressed]="lang() === 'uk'"
        (click)="set('uk')">
        UA
      </button>
      <button class="relative z-[1] px-3 py-[3px] border-0 bg-transparent rounded-full text-[0.7rem] font-semibold tracking-[0.04em] cursor-pointer text-[var(--muted-foreground)] transition-colors duration-150 leading-[1.4] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-1"
        [style.background]="lang() === 'en' ? 'var(--background)' : null"
        [style.color]="lang() === 'en' ? 'var(--foreground)' : null"
        [style.boxShadow]="lang() === 'en' ? '0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.08)' : null"
        aria-label="English"
        [attr.aria-pressed]="lang() === 'en'"
        (click)="set('en')">
        EN
      </button>
    </div>
  `,
})
export class LanguageSwitcher {
  private readonly _langService = inject(LanguageService);
  protected readonly lang = this._langService.lang;

  protected set(lang: 'uk' | 'en'): void {
    if (this.lang() !== lang) this._langService.toggle();
  }
}
