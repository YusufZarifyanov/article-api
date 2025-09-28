import { Module } from '@nestjs/common';

import { RedisService } from './services/redis.service';
import { RedisArticleService } from './services';

@Module({
  providers: [RedisService, RedisArticleService],
  exports: [RedisArticleService],
})
export class RedisModule {}
