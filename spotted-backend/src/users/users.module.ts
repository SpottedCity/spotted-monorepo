import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotBannedGuard } from '../auth/guards/not-banned.guard';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, NotBannedGuard],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}