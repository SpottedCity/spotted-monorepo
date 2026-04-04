import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    CommentModerationStatus,
    PostModerationStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
    applyUserScoreDelta,
    syncUserRoleAndBan,
} from '../common/reputation/reputation.helpers';

@Injectable()
export class ModerationService {
    constructor(private prisma: PrismaService) {}

    async getQueue(limit = 20, skip = 0) {
        return this.prisma.flag.findMany({
            where: {
                status: 'PENDING',
            },
            take: limit,
            skip,
            include: {
                post: true,
                comment: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                },
                reporter: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        reputationScore: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async removePost(moderatorId: string, postId: string, reason?: string) {
        return this.prisma.$transaction(async (tx) => {
            const post = await tx.post.findUnique({
                where: { id: postId },
                select: {
                    id: true,
                    authorId: true,
                },
            });

            if (!post) {
                throw new NotFoundException('Post not found');
            }

            const updated = await tx.post.update({
                where: { id: postId },
                data: {
                    isActive: false,
                    moderationStatus: PostModerationStatus.REMOVED_BY_MODERATOR,
                    moderatedAt: new Date(),
                    moderatedById: moderatorId,
                    moderationReason: reason || 'Removed by moderator',
                },
            });

            await applyUserScoreDelta(tx, post.authorId, -25, 10);
            await syncUserRoleAndBan(tx, post.authorId);

            return updated;
        });
    }

    async restorePost(moderatorId: string, postId: string, reason?: string) {
        return this.prisma.$transaction(async (tx) => {
            const post = await tx.post.findUnique({
                where: { id: postId },
                select: {
                    id: true,
                },
            });

            if (!post) {
                throw new NotFoundException('Post not found');
            }

            return tx.post.update({
                where: { id: postId },
                data: {
                    isActive: true,
                    moderationStatus: PostModerationStatus.RESTORED,
                    moderatedAt: new Date(),
                    moderatedById: moderatorId,
                    moderationReason: reason || 'Restored by moderator',
                },
            });
        });
    }

    async removeComment(
        moderatorId: string,
        commentId: string,
        reason?: string,
    ) {
        return this.prisma.$transaction(async (tx) => {
            const comment = await tx.comment.findUnique({
                where: { id: commentId },
                select: {
                    id: true,
                    authorId: true,
                },
            });

            if (!comment) {
                throw new NotFoundException('Comment not found');
            }

            const updated = await tx.comment.update({
                where: { id: commentId },
                data: {
                    isActive: false,
                    moderationStatus: CommentModerationStatus.REMOVED_BY_MODERATOR,
                    moderatedAt: new Date(),
                    moderatedById: moderatorId,
                    moderationReason: reason || 'Removed by moderator',
                },
            });

            await applyUserScoreDelta(tx, comment.authorId, -15, 10);
            await syncUserRoleAndBan(tx, comment.authorId);

            return updated;
        });
    }

    async restoreComment(
        moderatorId: string,
        commentId: string,
        reason?: string,
    ) {
        return this.prisma.$transaction(async (tx) => {
            const comment = await tx.comment.findUnique({
                where: { id: commentId },
                select: {
                    id: true,
                },
            });

            if (!comment) {
                throw new NotFoundException('Comment not found');
            }

            return tx.comment.update({
                where: { id: commentId },
                data: {
                    isActive: true,
                    moderationStatus: CommentModerationStatus.RESTORED,
                    moderatedAt: new Date(),
                    moderatedById: moderatorId,
                    moderationReason: reason || 'Restored by moderator',
                },
            });
        });
    }
}