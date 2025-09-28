import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { User } from '@app/entities';

import type { Id } from '@app/common/type-alias';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userEntity: Repository<User>,
  ) {}

  async findById(id: Id): Promise<User | null> {
    return this.userEntity.findOne({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userEntity.findOne({
      where: {
        email,
      },
    });
  }

  async create(
    params: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'articles'>,
  ): Promise<User> {
    const user = this.userEntity.create(params);

    await this.userEntity.save(user);

    return user;
  }
}
