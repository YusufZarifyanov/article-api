import { NestFactory } from '@nestjs/core';

import { CustomValidationPipe } from './common/pipes';
import { GlobalExceptionFilter } from './common/filters';

import { AppModule } from './app.module';

import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new CustomValidationPipe());

  app.useGlobalFilters(new GlobalExceptionFilter());

  const configService = app.get(ConfigService);
  const PORT = (configService.get('PORT') as number) || 3001;

  await app.listen(PORT);

  console.log(`Server running in port = ${PORT}`);
}

void bootstrap();
