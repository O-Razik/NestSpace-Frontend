export interface SpaceDtoShort {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface CreateSpaceDto {
  creatorId: string;
  name: string;
  memberIds: string[];
}