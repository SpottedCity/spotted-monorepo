import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotBannedGuard } from '../auth/guards/not-banned.guard';

@Module({
  imports: [PrismaModule],
  providers: [PostsService, NotBannedGuard],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}