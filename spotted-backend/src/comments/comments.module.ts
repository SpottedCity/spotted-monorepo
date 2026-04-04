import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotBannedGuard } from '../auth/guards/not-banned.guard';

@Module({
  imports: [PrismaModule],
  providers: [CommentsService, NotBannedGuard],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}