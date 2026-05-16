export interface TagDto {
  id: string;
  spaceId: string;
  title: string;
  color: string;
}

export interface CreateTagDto {
  spaceId: string;
  title: string;
  color: string;
}
