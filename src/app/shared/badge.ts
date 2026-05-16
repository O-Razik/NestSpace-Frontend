import { Component, input } from '@angular/core';

@Component({
  selector: 'badge',
  template: `
    @if (badge() > 0) {
      <span
        class="flex h-4 min-w-4 items-center
                 justify-center rounded-full
                 bg-destructive px-1 text-[9px]
                 font-bold text-white
                 border-1 border-red-800">
        {{ badge() > 99 ? '99+' : badge() }}
      </span>
    }
  `
})
export class Badge {
  badge  = input<number>(0);
}
