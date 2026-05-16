import { Directive, inject, input, TemplateRef } from '@angular/core';

@Directive({ selector: 'ng-template[settingsTab]' })
export class SettingsTabDirective {
  readonly key = input.required<string>();
  readonly label = input.required<string>();
  readonly showInAllOnly = input(false);
  readonly skipHeading = input(false);
  readonly templateRef = inject(TemplateRef<unknown>);
}
