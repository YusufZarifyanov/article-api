import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Article } from './article.entity';

import type { Id } from '@app/common/type-alias';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: Id;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  middleName?: string | null;

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
