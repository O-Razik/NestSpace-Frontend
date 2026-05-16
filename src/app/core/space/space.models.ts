import { UserDtoShort } from '../auth/auth.models';

export interface SpaceDtoShort {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface SpaceRoleDto {
  id: string;
  spaceId: string;
  name: string;
  rolePermissions: number;
}

export interface SpaceMemberDto {
  spaceId: string;
  userId: string;
  roleId: string;
  spaceUsername: string | null;
  subgroupId: string | null;
  joinedAt: string;
  role: SpaceRoleDto;
  user: UserDtoShort;
}

export interface SubgroupDto {
  id: string;
  spaceId: string;
  name: string;
}

export interface CreateSubgroupDto {
  name: string;
}

export interface SpaceDto extends SpaceDtoShort {
  members: SpaceMemberDto[];
  roles: SpaceRoleDto[];
  subgroups: SubgroupDto[];
}

export interface CreateSpaceDto {
  creatorId: string;
  name: string;
  memberIds: string[];
}

export interface AddSpaceMemberDto {
  userId: string;
  roleId: string;
}

export interface UpdateSpaceMemberDto {
  spaceId: string;
  userId: string;
  roleId: string;
  spaceUsername: string | null;
  subgroupId: string | null;
  joinedAt: string;
}

export interface CreateSpaceRoleDto {
  name: string;
  rolePermissions: number;
}

export interface SpacePermissionDef {
  flag: number;
  label: string;
}

export const SPACE_PERMISSIONS: SpacePermissionDef[] = [
  { flag: 1,   label: 'Керувати чатами' },
  { flag: 2,   label: 'Керувати нотатками' },
  { flag: 4,   label: 'Керувати завданнями' },
  { flag: 8,   label: 'Керувати категоріями' },
  { flag: 16,  label: 'Особисті події' },
  { flag: 32,  label: 'Регулярні події' },
  { flag: 64,  label: 'Керувати тегами' },
  { flag: 128, label: 'Керувати учасниками' },
  { flag: 256, label: 'Керувати простором' },
  { flag: 512, label: 'Видалити простір' },
];
