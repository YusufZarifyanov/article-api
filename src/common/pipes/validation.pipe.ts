import {
  type ArgumentMetadata,
  ValidationPipe,
  type ValidationError,
} from '@nestjs/common';
import { ValidationCustomError } from '../errors';

type QueryParams = {
  filters?: string;
};

export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = this.flattenValidationErrors(errors);

        throw new ValidationCustomError(messages);
      },
    });
  }

  async transform(
    value: QueryParams,
    metadata: ArgumentMetadata,
  ): Promise<any> {
    if (metadata.type === 'query' && value && typeof value === 'object') {
      const parse = (value: any, key: string): void => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          value[key] = JSON.parse(value[key]);
        } catch (error) {
          console.error('JSON parse error in filters:', error);
        }
      };

      if ('filters' in value && typeof value.filters === 'string') {
        parse(value, 'filters');
      }

      if ('sorts' in value && typeof value.sorts === 'string') {
        parse(value, 'sorts');
      }
    }

    return super.transform(value, metadata);
  }

  flattenValidationErrors(errors: ValidationError[]): string[] {
    const messages: string[] = [];

    errors.forEach((error) => {
      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }

      if (error.children && error.children.length > 0) {
        messages.push(...this.flattenValidationErrors(error.children));
      }
    });

    return messages;
  }
}
