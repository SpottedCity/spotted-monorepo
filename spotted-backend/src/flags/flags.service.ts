import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFlagDto } from './dto/create-flag.dto';
import {
  CommentModerationStatus,
  FlagStatus,
  PostModerationStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  applyUserScoreDelta,
  syncUserRoleAndBan,
} from '../common/reputation/reputation.helpers';

@Injectable()
export class FlagsService {
  constructor(private prisma: PrismaService) {}

  private getReporterWeight(role: UserRole): number {
    if (role === UserRole.ADMIN) return 3;
    if (role === UserRole.MODERATOR) return 2;
    return 1;
  }

  private async syncPostReportState(tx: any, postId: string) {
    const [agg, post] = await Promise.all([
      tx.flag.aggregate({
        where: {
          postId,
          status: FlagStatus.PENDING,
        },
        _count: { _all: true },
        _sum: { weight: true },
      }),
      tx.post.findUnique({
        where: { id: postId },
        select: {
          id: true,
          isActive: true,
          moderationStatus: true,
        },
      }),
    ]);

    if (!post) return;

    const reportCount = agg._count._all ?? 0;
    const reportScore = agg._sum.weight ?? 0;
    const shouldAutoHide = reportCount >= 3 && reportScore >= 5;

    if (shouldAutoHide) {
      await tx.post.update({
        where: { id: postId },
        data: {
          reportCount,
          reportScore,
          isActive: false,
          moderationStatus:
              post.moderationStatus === PostModerationStatus.REMOVED_BY_MODERATOR
                  ? PostModerationStatus.REMOVED_BY_MODERATOR
                  : PostModerationStatus.HIDDEN_BY_REPORTS,
          moderationReason:
              post.moderationStatus === PostModerationStatus.REMOVED_BY_MODERATOR
                  ? post.moderationStatus
                  : 'Auto-hidden after reports',
        },
      });
      return;
    }

    const restoreData: any = {
      reportCount,
      reportScore,
    };

    if (post.moderationStatus === PostModerationStatus.HIDDEN_BY_REPORTS) {
      restoreData.isActive = true;
      restoreData.moderationStatus = PostModerationStatus.ACTIVE;
      restoreData.moderationReason = null;
      restoreData.moderatedAt = null;
      restoreData.moderatedById = null;
    }

    await tx.post.update({
      where: { id: postId },
      data: restoreData,
    });
  }

  private async syncCommentReportState(tx: any, commentId: string) {
    const [agg, comment] = await Promise.all([
      tx.flag.aggregate({
        where: {
          commentId,
          status: FlagStatus.PENDING,
        },
        _count: { _all: true },
        _sum: { weight: true },
      }),
      tx.comment.findUnique({
        where: { id: commentId },
        select: {
          id: true,
          isActive: true,
          moderationStatus: true,
        },
      }),
    ]);

    if (!comment) return;

    const reportCount = agg._count._all ?? 0;
    const reportScore = agg._sum.weight ?? 0;
    const shouldAutoHide = reportCount >= 3 && reportScore >= 5;

    if (shouldAutoHide) {
      await tx.comment.update({
        where: { id: commentId },
        data: {
          reportCount,
          reportScore,
          isActive: false,
          moderationStatus:
              comment.moderationStatus ===
              CommentModerationStatus.REMOVED_BY_MODERATOR
                  ? CommentModerationStatus.REMOVED_BY_MODERATOR
                  : CommentModerationStatus.HIDDEN_BY_REPORTS,
          moderationReason:
              comment.moderationStatus ===
              CommentModerationStatus.REMOVED_BY_MODERATOR
                  ? comment.moderationStatus
                  : 'Auto-hidden after reports',
        },
      });
      return;
    }

    const restoreData: any = {
      reportCount,
      reportScore,
    };

    if (
        comment.moderationStatus === CommentModerationStatus.HIDDEN_BY_REPORTS
    ) {
      restoreData.isActive = true;
      restoreData.moderationStatus = CommentModerationStatus.ACTIVE;
      restoreData.moderationReason = null;
      restoreData.moderatedAt = null;
      restoreData.moderatedById = null;
    }

    await tx.comment.update({
      where: { id: commentId },
      data: restoreData,
    });
  }

  async createFlag(reporterId: string, createFlagDto: CreateFlagDto) {
    const hasPostId = !!createFlagDto.postId;
    const hasCommentId = !!createFlagDto.commentId;

    if ((hasPostId && hasCommentId) || (!hasPostId && !hasCommentId)) {
      throw new BadRequestException(
          'Exactly one target is required: postId or commentId',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const reporter = await tx.user.findUnique({
        where: { id: reporterId },
        select: {
          id: true,
          role: true,
        },
      });

      if (!reporter) {
        throw new NotFoundException('Reporter not found');
      }

      const weight = this.getReporterWeight(reporter.role);

      if (createFlagDto.postId) {
        const post = await tx.post.findUnique({
          where: { id: createFlagDto.postId },
          select: {
            id: true,
            title: true,
            authorId: true,
            isActive: true,
            moderationStatus: true,
          },
        });

        if (!post) {
          throw new NotFoundException('Post not found');
        }

        const existing = await tx.flag.findFirst({
          where: {
            reporterId,
            postId: createFlagDto.postId,
          },
        });

        if (existing) {
          throw new BadRequestException('Flag already exists for this post');
        }

        const flag = await tx.flag.create({
          data: {
            postId: createFlagDto.postId,
            reporterId,
            reason: createFlagDto.reason,
            description: createFlagDto.description,
            status: FlagStatus.PENDING,
            weight,
          },
          include: {
            post: {
              select: {
                id: true,
                title: true,
                authorId: true,
              },
            },
            comment: true,
            reporter: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        });

        await this.syncPostReportState(tx, createFlagDto.postId);

        return flag;
      }

      const comment = await tx.comment.findUnique({
        where: { id: createFlagDto.commentId! },
        select: {
          id: true,
          content: true,
          authorId: true,
          isActive: true,
          moderationStatus: true,
          postId: true,
        },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      const existing = await tx.flag.findFirst({
        where: {
          reporterId,
          commentId: createFlagDto.commentId!,
        },
      });

      if (existing) {
        throw new BadRequestException('Flag already exists for this comment');
      }

      const flag = await tx.flag.create({
        data: {
          commentId: createFlagDto.commentId!,
          reporterId,
          reason: createFlagDto.reason,
          description: createFlagDto.description,
          status: FlagStatus.PENDING,
          weight,
        },
        include: {
          post: true,
          comment: {
            select: {
              id: true,
              content: true,
              authorId: true,
              postId: true,
            },
          },
          reporter: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });

      await this.syncCommentReportState(tx, createFlagDto.commentId!);

      return flag;
    });
  }

  async getFlags(status: FlagStatus = FlagStatus.PENDING, limit = 20, skip = 0) {
    return this.prisma.flag.findMany({
      where: { status },
      skip,
      take: limit,
      include: {
        post: true,
        comment: true,
        reporter: {
          select: {
            id: true,
            email: true,
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

  async resolveFlag(flagId: string, status: FlagStatus, resolvedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      const flag = await tx.flag.findUnique({
        where: { id: flagId },
        include: {
          post: {
            select: {
              id: true,
              authorId: true,
              moderationStatus: true,
            },
          },
          comment: {
            select: {
              id: true,
              authorId: true,
              moderationStatus: true,
            },
          },
          reporter: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!flag) {
        throw new NotFoundException('Flag not found');
      }

      if (flag.status !== FlagStatus.PENDING) {
        throw new BadRequestException('Flag is already resolved');
      }

      const updatedFlag = await tx.flag.update({
        where: { id: flagId },
        data: {
          status,
          resolvedBy,
          resolvedAt: new Date(),
        },
      });

      if (status === FlagStatus.RESOLVED) {
        if (flag.postId && flag.post) {
          await tx.post.update({
            where: { id: flag.postId },
            data: {
              isActive: false,
              moderationStatus: PostModerationStatus.REMOVED_BY_MODERATOR,
              moderatedAt: new Date(),
              moderatedById: resolvedBy,
              moderationReason: `Resolved flag: ${flag.reason}`,
            },
          });

          await applyUserScoreDelta(tx, flag.reporterId, 15, 0);
          await applyUserScoreDelta(tx, flag.post.authorId, -25, 10);
          await syncUserRoleAndBan(tx, flag.reporterId);
          await syncUserRoleAndBan(tx, flag.post.authorId);
        }

        if (flag.commentId && flag.comment) {
          await tx.comment.update({
            where: { id: flag.commentId },
            data: {
              isActive: false,
              moderationStatus: CommentModerationStatus.REMOVED_BY_MODERATOR,
              moderatedAt: new Date(),
              moderatedById: resolvedBy,
              moderationReason: `Resolved flag: ${flag.reason}`,
            },
          });

          await applyUserScoreDelta(tx, flag.reporterId, 10, 0);
          await applyUserScoreDelta(tx, flag.comment.authorId, -15, 10);
          await syncUserRoleAndBan(tx, flag.reporterId);
          await syncUserRoleAndBan(tx, flag.comment.authorId);
        }
      }

      if (status === FlagStatus.DISMISSED) {
        await applyUserScoreDelta(tx, flag.reporterId, -10, 5);
        await syncUserRoleAndBan(tx, flag.reporterId);
      }

      if (flag.postId) {
        await this.syncPostReportState(tx, flag.postId);
      }

      if (flag.commentId) {
        await this.syncCommentReportState(tx, flag.commentId);
      }

      return updatedFlag;
    });
  }

  async getFlagsByPost(postId: string) {
    return this.prisma.flag.findMany({
      where: { postId },
      include: {
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

  async getFlagsByComment(commentId: string) {
    return this.prisma.flag.findMany({
      where: { commentId },
      include: {
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
}