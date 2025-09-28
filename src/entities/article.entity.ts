import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

import type { Id } from '@app/common/type-alias';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: Id;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  publicationDate: Date;

  @ManyToOne(() => User, (user) => user.articles)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: Id;

  @UpdateDateColumn()
  updatedAt: Date;
}
