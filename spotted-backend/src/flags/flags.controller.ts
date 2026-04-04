import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { FlagStatus, UserRole } from '@prisma/client';
import { FlagsService } from './flags.service';
import { CreateFlagDto } from './dto/create-flag.dto';
import { ResolveFlagDto } from './dto/resolve-flag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotBannedGuard } from '../auth/guards/not-banned.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserId } from '../common/decorators/user.decorator';

@Controller('flags')
export class FlagsController {
    constructor(private flagsService: FlagsService) {}

    @Post()
    @UseGuards(JwtAuthGuard, NotBannedGuard)
    async createFlag(
        @Body() createFlagDto: CreateFlagDto,
        @UserId() userId: string,
    ) {
        return this.flagsService.createFlag(userId, createFlagDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.MODERATOR, UserRole.ADMIN)
    async getFlags(
        @Query('status') status?: FlagStatus,
        @Query('limit') limit?: string,
        @Query('skip') skip?: string,
    ) {
        return this.flagsService.getFlags(
            status ?? FlagStatus.PENDING,
            limit ? parseInt(limit, 10) : 20,
            skip ? parseInt(skip, 10) : 0,
        );
    }

    @Get('post/:postId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.MODERATOR, UserRole.ADMIN)
    async getFlagsByPost(@Param('postId') postId: string) {
        return this.flagsService.getFlagsByPost(postId);
    }

    @Get('comment/:commentId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.MODERATOR, UserRole.ADMIN)
    async getFlagsByComment(@Param('commentId') commentId: string) {
        return this.flagsService.getFlagsByComment(commentId);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.MODERATOR, UserRole.ADMIN)
    async resolveFlag(
        @Param('id') id: string,
        @Body() body: ResolveFlagDto,
        @UserId() userId: string,
    ) {
        return this.flagsService.resolveFlag(id, body.status, userId);
    }
}