import { IsDateString, IsOptional, IsString } from 'class-validator';

export class GetArticleListFilterDto {
  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
