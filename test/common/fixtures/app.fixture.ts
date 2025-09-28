import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '@app/modules/auth/auth.module';
import { UserModule } from '@app/modules/user/user.module';
import { ArticleModule } from '@app/modules/article/article.module';

import type { INestApplication } from '@nestjs/common';
import type { DataSource } from 'typeorm';

import { closeTestDataSource, getTestDataSource } from '../utils';

import { CustomValidationPipe } from '@app/common/pipes';
import { RedisModule } from '@app/modules/redis/redis.module';

export class TestAppFixture {
  private static app: INestApplication;
  private static datasource: DataSource;

  static async getApp(): Promise<INestApplication> {
    if (!this.app) {
      await this.initialize();
    }
    return this.app;
  }

  static async close(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
    if (this.datasource) {
      await closeTestDataSource();
    }
  }

  private static async initialize(): Promise<void> {
    this.datasource = getTestDataSource();

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          useFactory: () => this.datasource.options,
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET') ?? 'test-secret',
            signOptions: {
              expiresIn: configService.get('JWT_EXPIRATION_TIME') ?? '1h',
            },
          }),
          inject: [ConfigService],
        }),
        AuthModule,
        UserModule,
        ArticleModule,
        RedisModule,
      ],
    }).compile();

    await this.datasource.initialize();

    this.app = moduleRef.createNestApplication();

    this.app.useGlobalPipes(new CustomValidationPipe());

    await this.app.init();
  }
}
