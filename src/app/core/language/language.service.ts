import { inject, Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

type Lang = 'en' | 'uk';

const STORAGE_KEY = 'nestspace.lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly _transloco = inject(TranslocoService);

  readonly lang = signal<Lang>(this._readStorage());

  constructor() {
    this._transloco.setActiveLang(this.lang());
  }

  toggle(): void {
    const next: Lang = this.lang() === 'uk' ? 'en' : 'uk';
    this.lang.set(next);
    this._transloco.setActiveLang(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }

  private _readStorage(): Lang {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'uk';
    } catch {
      return 'uk';
    }
  }
}
