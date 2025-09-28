import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import type { Id } from '@app/common/type-alias';

import { ArticleService } from './article.service';

import {
  CreateArticleRequestDto,
  CreateArticleResponseDto,
  DeleteArticleResponseDto,
  GetArticleListRequestDto,
  GetArticleListResponseDto,
  GetArticleResponseDto,
  PatchArticleRequestDto,
  PatchArticleResponseDto,
} from './dto';

import { AuthGuard } from '@app/common/guards';
import { GetUserId } from '@app/common/decorators';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() articleDto: CreateArticleRequestDto,
    @GetUserId() authorId: Id,
  ): Promise<CreateArticleResponseDto> {
    const { articleId } = await this.articleService.createArticle({
      article: articleDto,
      authorId,
    });

    return new CreateArticleResponseDto(articleId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: Id,
    @Body() updateArticleDto: PatchArticleRequestDto,
    @GetUserId() authorId: Id,
  ): Promise<PatchArticleResponseDto> {
    await this.articleService.patchArticle({
      articleId: id,
      articleBody: updateArticleDto,
      authorId,
    });

    return new PatchArticleResponseDto(id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOne(
    @Param('id', ParseIntPipe) id: Id,
  ): Promise<GetArticleResponseDto> {
    const article = await this.articleService.getArticleById(id);

    return new GetArticleResponseDto(article);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() queryDto: GetArticleListRequestDto,
  ): Promise<GetArticleListResponseDto> {
    const { articles, total } =
      await this.articleService.getArticlesByFilters(queryDto);

    return new GetArticleListResponseDto(articles, total);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: Id,
    @GetUserId() authorId: Id,
  ): Promise<DeleteArticleResponseDto> {
    await this.articleService.deleteArticleById(id, authorId);

    return new DeleteArticleResponseDto(id);
  }
}
