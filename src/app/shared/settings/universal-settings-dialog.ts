import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSettings } from '@ng-icons/lucide';
import { TranslocoPipe } from '@jsverse/transloco';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { SettingsTabDirective } from './settings-tab.directive';

@Component({
  selector: 'universal-settings-dialog',
  imports: [
    NgTemplateOutlet,
    HlmButtonImports,
    HlmDialogImports,
    HlmIcon,
    HlmSeparatorImports,
    HlmTabsImports,
    NgIcon,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [provideIcons({ lucideSettings })],
  host: { class: 'contents' },
  template: `
    <hlm-dialog [state]="externalState()" closeOnBackdropClick (stateChanged)="onStateChange($event)">
      @if (!hideTrigger()) {
        <button hlmBtn variant="ghost" size="icon-sm" hlmDialogTrigger [attr.aria-label]="triggerLabel()">
          <ng-icon hlm name="lucideSettings" size="sm" />
        </button>
      }

      <hlm-dialog-content *hlmDialogPortal [showCloseButton]="false"
        [class]="'flex flex-col gap-0 p-0 w-full max-w-xl h-[70vh] min-h-[70vh]' + contentClass()">

        <ng-content select="[dialogOverlay]" />

        @if (loading()) {
          <div class="flex items-center justify-center py-16 text-sm text-muted-foreground">
            {{ 'settings.loading' | transloco }}
          </div>
        } @else {
          <div hlmTabs="all" (hlmTabsChange)="onTabChange($event)" class="flex flex-col flex-1 min-h-0">

            <div class="flex items-center justify-between px-4 py-2 border-b shrink-0">
              <div hlmTabsList class="w-auto justify-start">
                <button hlmTabsTrigger="all">{{ allLabel() }}</button>
                @for (tab of _tabs(); track tab.key()) {
                  @if (!tab.showInAllOnly()) {
                    <button [hlmTabsTrigger]="tab.key()">{{ tab.label() }}</button>
                  }
                }
              </div>
              <ng-content select="[headerActions]" />
            </div>

            <div class="overflow-y-auto flex-1 min-h-0">
              @for (tab of _tabs(); track tab.key(); let last = $last) {
                @if (activeTab() === 'all' || (activeTab() === tab.key() && !tab.showInAllOnly())) {
                  <section class="p-5" [attr.aria-labelledby]="'st-' + tab.key()">
                    @if (activeTab() === 'all' && tab.label() && !tab.skipHeading()) {
                      <h3 [id]="'st-' + tab.key()" class="mb-4 text-sm font-semibold">{{ tab.label() }}</h3>
                    }
                    <ng-container [ngTemplateOutlet]="tab.templateRef" />
                  </section>
                }
                @if (activeTab() === 'all' && !last) {
                  <hlm-separator />
                }
              }
            </div>

          </div>
        }

      </hlm-dialog-content>
    </hlm-dialog>
  `,
})
export class UniversalSettingsDialog {
  readonly triggerLabel = input('');
  readonly loading = input(false);
  readonly allLabel = input('');
  readonly contentClass = input('max-w-xl max-h-[88vh]');
  readonly externalState = input<BrnDialogState | null>(null);
  readonly initialTab = input('all');
  readonly hideTrigger = input(false);
  readonly opened = output<void>();
  readonly closed = output<void>();

  protected readonly _tabs = contentChildren(SettingsTabDirective);
  protected readonly activeTab = signal('all');

  protected onStateChange(state: BrnDialogState): void {
    if (state === 'open') {
      this.activeTab.set(this.initialTab());
      this.opened.emit();
    } else {
      this.closed.emit();
    }
  }

  protected onTabChange(tab: string | undefined): void {
    if (tab) this.activeTab.set(tab);
  }
}
