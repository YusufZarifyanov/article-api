import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.respository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
