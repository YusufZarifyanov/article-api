import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { Article } from '@app/entities';

import type {
  FindAllByFiltersParams,
  FindAllByFiltersReturns,
} from './interfaces/repositories';
import type { Id } from '@app/common/type-alias';
import { SortOrder } from '@app/common/enums';

@Injectable()
export class ArticleRepository {
  constructor(
    @InjectRepository(Article)
    private readonly articleEntity: Repository<Article>,
  ) {}

  async create(
    params: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Article> {
    const article = this.articleEntity.create(params);

    await this.articleEntity.save(article);

    return article;
  }

  async findById(id: Id): Promise<Article | null> {
    return this.articleEntity.findOne({
      where: {
        id,
      },
    });
  }

  async findByIdWithRelations(id: Id): Promise<Article | null> {
    return this.articleEntity.findOne({
      where: {
        id,
      },
      relations: ['author'],
    });
  }

  async findAllByFilters({
    page,
    size,
    filters,
    sorts,
  }: FindAllByFiltersParams): Promise<FindAllByFiltersReturns> {
    const where: FindOptionsWhere<Article> = {};
    const order: FindOptionsOrder<Article> = {};

    FillWhereClause: {
      const { author, startDate, endDate, search } = filters;

      if (author) {
        where.author = { firstName: Like(`%${author}%`) };
      }

      if (startDate && endDate) {
        where.publicationDate = Between(new Date(startDate), new Date(endDate));
      } else if (startDate) {
        where.publicationDate = MoreThanOrEqual(new Date(startDate));
      } else if (endDate) {
        where.publicationDate = LessThanOrEqual(new Date(endDate));
      }

      if (search) {
        where.title = Like(`%${search}%`);
      }

      break FillWhereClause;
    }

    FillOrderClause: {
      const { articleId, publicationDate, author } = sorts;

      if (articleId) {
        order.id = articleId;
      }

      if (publicationDate) {
        order.publicationDate = publicationDate;
      }

      if (author) {
        order.author = {
          firstName: author,
        };
      }

      if (Object.keys(order).length === 0) {
        order.publicationDate = SortOrder.Desc;
      }

      break FillOrderClause;
    }

    const [articles, total] = await this.articleEntity.findAndCount({
      where,
      relations: ['author'],
      skip: (page - 1) * size,
      take: size,
      order,
    });

    return {
      articles,
      total,
    };
  }

  async patch(
    article: Omit<Article, 'createdAt' | 'updatedAt' | 'author' | 'authorId'>,
  ): Promise<Article> {
    return this.articleEntity.save(article);
  }

  async delete(article: Article): Promise<void> {
    await this.articleEntity.remove(article);
  }
}
