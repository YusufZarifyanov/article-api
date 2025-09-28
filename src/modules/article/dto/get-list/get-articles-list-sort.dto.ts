import { SortOrder } from '@app/common/enums';
import { IsEnum, IsOptional } from 'class-validator';

export class GetArticleListSortDto {
  @IsOptional()
  @IsEnum(SortOrder)
  author?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  publicationDate?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  articleId?: SortOrder;
}
