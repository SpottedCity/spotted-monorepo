import { Module } from '@nestjs/common';
import { FlagsService } from './flags.service';
import { FlagsController } from './flags.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotBannedGuard } from '../auth/guards/not-banned.guard';

@Module({
  imports: [PrismaModule],
  providers: [FlagsService, NotBannedGuard],
  controllers: [FlagsController],
  exports: [FlagsService],
})
export class FlagsModule {}