export interface SpaceMember {
  id: string;
  name: string;
  /** Real account username — always the original login name. */
  username: string;
  avatarUrl: string | null;
  avatarColor: string;
  role?: string | null;
  online: boolean;
  subgroupId: string | null;
  hasAccess?: boolean;
}

export type DisplayMode = 'list' | 'byGroup';
export type SubgroupFilter = 'all' | string;
