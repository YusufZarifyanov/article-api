import { IsOptional, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import type { IGetArticleListParams } from '@types';

import { GetArticleListFilterDto } from './get-article-list-filter.dto';
import { GetArticleListSortDto } from './get-articles-list-sort.dto';

export class GetArticleListRequestDto implements IGetArticleListParams {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  size: number = 10;

  @IsOptional()
  @ValidateNested()
  @Type(() => GetArticleListFilterDto)
  filters: GetArticleListFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GetArticleListSortDto)
  sorts: GetArticleListSortDto;
}
