import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CategoryCreateDto, CategoryDto, CategoryShortDto } from '../models/category';
import { CreateTagDto, TagDto } from '../models/tag';

@Injectable({ providedIn: 'root' })
export class EventCategoryApiService {
  private readonly _http = inject(HttpClient);
  private readonly _base = environment.apiUrl;

  getCategories(spaceId: string) {
    return this._http.get<CategoryShortDto[]>(`${this._base}/space/${spaceId}/events/categories`);
  }

  getCategory(spaceId: string, categoryId: string) {
    return this._http.get<CategoryDto>(`${this._base}/space/${spaceId}/events/categories/${categoryId}`);
  }

  createCategory(spaceId: string, dto: CategoryCreateDto) {
    return this._http.post<CategoryShortDto>(`${this._base}/space/${spaceId}/events/categories`, dto);
  }

  updateCategory(dto: CategoryShortDto) {
    return this._http.put<CategoryDto>(`${this._base}/space/${dto.spaceId}/events/categories`, dto);
  }

  deleteCategory(spaceId: string, categoryId: string) {
    return this._http.delete<boolean>(`${this._base}/space/${spaceId}/events/categories/${categoryId}`);
  }

  getTags(spaceId: string) {
    return this._http.get<TagDto[]>(`${this._base}/space/${spaceId}/events/tags`);
  }

  createTag(spaceId: string, dto: CreateTagDto) {
    return this._http.post<TagDto>(`${this._base}/space/${spaceId}/events/tags`, dto);
  }

  updateTag(spaceId: string, dto: TagDto) {
    return this._http.put<TagDto>(`${this._base}/space/${spaceId}/events/tags`, dto);
  }

  deleteTag(spaceId: string, tagId: string) {
    return this._http.delete<boolean>(`${this._base}/space/${spaceId}/events/tags/${tagId}`);
  }
}
