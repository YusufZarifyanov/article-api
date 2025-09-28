import type { ICreateArticleParams } from '@types';

import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArticleRequestDto implements ICreateArticleParams {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  publicationDate?: Date;
}
