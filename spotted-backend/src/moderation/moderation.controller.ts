import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserId } from '../common/decorators/user.decorator';
import { ModerationService } from './moderation.service';

@Controller('moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MODERATOR, UserRole.ADMIN)
export class ModerationController {
    constructor(private moderationService: ModerationService) {}

    @Get('queue')
    async getQueue(
        @Query('limit') limit?: string,
        @Query('skip') skip?: string,
    ) {
        return this.moderationService.getQueue(
            limit ? parseInt(limit, 10) : 20,
            skip ? parseInt(skip, 10) : 0,
        );
    }

    @Post('posts/:id/remove')
    async removePost(
        @Param('id') id: string,
        @Body() body: { reason?: string },
        @UserId() moderatorId: string,
    ) {
        return this.moderationService.removePost(moderatorId, id, body?.reason);
    }

    @Post('posts/:id/restore')
    async restorePost(
        @Param('id') id: string,
        @Body() body: { reason?: string },
        @UserId() moderatorId: string,
    ) {
        return this.moderationService.restorePost(moderatorId, id, body?.reason);
    }

    @Post('comments/:id/remove')
    async removeComment(
        @Param('id') id: string,
        @Body() body: { reason?: string },
        @UserId() moderatorId: string,
    ) {
        return this.moderationService.removeComment(moderatorId, id, body?.reason);
    }

    @Post('comments/:id/restore')
    async restoreComment(
        @Param('id') id: string,
        @Body() body: { reason?: string },
        @UserId() moderatorId: string,
    ) {
        return this.moderationService.restoreComment(
            moderatorId,
            id,
            body?.reason,
        );
    }
}