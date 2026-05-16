import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { DisplayMode, SpaceMember, SubgroupFilter } from './members-panel.types';
import { SpaceMemberDto, SubgroupDto } from '../../core/space/space.models';
import { MembersPanelTopbar } from './members-panel-topbar';
import { MembersPanelCollapsed } from './members-panel-collapsed';
import { MembersPanelUserCard } from './members-panel-user-card';
import { MembersPanelChatView } from './members-panel-chat-view';
import { MembersPanelListView } from './members-panel-list-view';
import { MembersPanelGroupView } from './members-panel-group-view';

@Component({
  selector: 'members-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MembersPanelTopbar, MembersPanelCollapsed, MembersPanelUserCard,
    MembersPanelChatView, MembersPanelListView, MembersPanelGroupView,
  ],
  host: {
    class: 'flex flex-col overflow-hidden shrink-0 h-full bg-[var(--sidebar)] border-l border-[var(--border)] font-mono transition-[width] duration-200',
    '[style.width.px]': 'isOpen() ? 190 : 42',
    role: 'complementary',
    '[attr.aria-label]': '_panelLabel()',
  },
  template: `
    @if (isOpen()) {
      <members-panel-topbar
        [displayMode]="displayMode()"
        [hasSubgroups]="hasSubgroups()"
        [subgroupFilter]="subgroupFilter()"
        [subgroupOptions]="subgroupOptions()"
        (displayModeChange)="_onDisplayModeChange($event)"
        (subgroupFilterChange)="subgroupFilter.set($event)"
        (collapse)="toggle()" />

      <div class="flex-1 overflow-y-auto scrollbar-thin" role="list">
        @if (chatMode()) {
          <members-panel-chat-view
            [withAccessOnline]="withAccessOnline()"
            [withAccessOffline]="withAccessOffline()"
            [withoutAccess]="withoutAccess()"
            (memberClick)="memberClick.emit($event)" />
        } @else if (displayMode() === 'list') {
          <members-panel-list-view
            [online]="onlineMembers()"
            [offline]="offlineMembers()"
            (memberClick)="memberClick.emit($event)" />
        } @else {
          <members-panel-group-view
            [sections]="byGroupSections()"
            [collapsedIds]="_collapsedGroups()"
            (memberClick)="memberClick.emit($event)"
            (toggleGroup)="toggleGroup($event)" />
        }
      </div>

      @if (spaceId() && currentMemberDto()) {
        <members-panel-user-card
          [spaceId]="spaceId()!"
          [memberDto]="currentMemberDto()!" />
      }

    } @else {

      <members-panel-collapsed
        [members]="members()"
        [onlineCount]="onlineCount()"
        (expand)="toggle()"
        (memberClick)="memberClick.emit($event)" />

    }
  `,
})
export class MembersPanel {
  private readonly _STORAGE_KEY = 'nestspace.membersPanel.open';
  private readonly _t = inject(TranslocoService);

  readonly members = input.required<SpaceMember[]>();
  readonly subgroups = input.required<SubgroupDto[]>();
  readonly chatMode = input(false);
  readonly spaceId = input.required<string | null>();
  readonly currentMemberDto = input.required<SpaceMemberDto | null>();
  readonly memberClick = output<SpaceMember>();

  readonly isOpen = signal(this._readStorage());
  readonly displayMode = signal<DisplayMode>('list');
  readonly subgroupFilter = signal<SubgroupFilter>('all');
  protected readonly _collapsedGroups = signal<Set<string>>(new Set());

  protected readonly _panelLabel = computed(() => this._t.translate('members.panelLabel'));

  /** In list mode, filter members by selected subgroup.
   *  'all' shows everyone; specific subgroup ID shows only that subgroup's members. */
  readonly filteredMembers = computed(() => {
    const filter = this.subgroupFilter();
    if (filter === 'all') return this.members();
    return this.members().filter(m => m.subgroupId === filter);
  });

  readonly onlineMembers = computed(() => this.filteredMembers().filter(m => m.online));
  readonly offlineMembers = computed(() => this.filteredMembers().filter(m => !m.online));

  readonly withAccessOnline = computed(() =>
    this.members().filter(m => m.hasAccess !== false && m.online),
  );
  readonly withAccessOffline = computed(() =>
    this.members().filter(m => m.hasAccess !== false && !m.online),
  );
  readonly withoutAccess = computed(() =>
    this.members().filter(m => m.hasAccess === false),
  );

  /** Sections for byGroup mode: one section per subgroup + one "Whole space" for unassigned. */
  readonly byGroupSections = computed(() => {
    const members = this.members();
    const sgs = this.subgroups();

    const sections = sgs.map(sg => ({
      id: sg.id,
      label: sg.name,
      online: members.filter(m => m.subgroupId === sg.id && m.online),
      offline: members.filter(m => m.subgroupId === sg.id && !m.online),
    }));

    const unassigned = members.filter(m => m.subgroupId === null);
    if (unassigned.length > 0 || sgs.length === 0) {
      sections.push({
        id: '__none__',
        label: this._t.translate('members.wholeSpace'),
        online: unassigned.filter(m => m.online),
        offline: unassigned.filter(m => !m.online),
      });
    }

    return sections;
  });

  readonly onlineCount = computed(() => this.members().filter(m => m.online).length);

  readonly hasSubgroups = computed(() => this.subgroups().length > 0);

  readonly subgroupOptions = computed(() =>
    this.subgroups().map(sg => ({ value: sg.id, label: sg.name })),
  );

  toggleGroup(id: string): void {
    this._collapsedGroups.update(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  /** When switching away from byGroup, reset filter so list mode shows all members. */
  _onDisplayModeChange(mode: DisplayMode): void {
    this.displayMode.set(mode);
    if (mode === 'list') this.subgroupFilter.set('all');
  }

  toggle(): void {
    const next = !this.isOpen();
    this.isOpen.set(next);
    localStorage.setItem(this._STORAGE_KEY, String(next));
  }

  private _readStorage(): boolean {
    try {
      return localStorage.getItem(this._STORAGE_KEY) !== 'false';
    } catch {
      return true;
    }
  }
}
