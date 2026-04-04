import { Module } from '@nestjs/common';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotBannedGuard } from '../auth/guards/not-banned.guard';

@Module({
  imports: [PrismaModule],
  providers: [VotesService, NotBannedGuard],
  controllers: [VotesController],
  exports: [VotesService],
})
export class VotesModule {}