import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { ArticleRepository } from './article.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '@app/entities';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    UserModule,
    JwtModule,
    TypeOrmModule.forFeature([Article]),
    RedisModule,
  ],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository],
})
export class ArticleModule {}
