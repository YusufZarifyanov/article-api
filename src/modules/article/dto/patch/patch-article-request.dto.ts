import type { IPatchArticleParams } from '@types';

import { IsDateString, IsOptional, IsString } from 'class-validator';

export class PatchArticleRequestDto implements IPatchArticleParams {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsDateString()
  publicationDate?: Date;
}
