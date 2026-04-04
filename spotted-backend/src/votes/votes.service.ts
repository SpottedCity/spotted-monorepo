import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  applyUserScoreDelta,
  syncUserRoleAndBan,
} from '../common/reputation/reputation.helpers';

@Injectable()
export class VotesService {
  constructor(private prisma: PrismaService) {}

  private postVoteRep(value: number): number {
    return value === 1 ? 5 : -2;
  }

  private commentVoteRep(value: number): number {
    return value === 1 ? 2 : -1;
  }

  private async getCommentWithRelations(commentId: string) {
    return this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: true,
        replies: {
          include: {
            author: true,
          },
        },
      },
    });
  }

  async voteOnPost(userId: string, postId: string, value: number) {
    if (value !== 1 && value !== -1) {
      throw new BadRequestException('Vote value must be 1 or -1');
    }

    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({
        where: { id: postId },
        select: {
          id: true,
          authorId: true,
          isActive: true,
        },
      });

      if (!post || !post.isActive) {
        throw new NotFoundException('Post not found');
      }

      const existingVote = await tx.vote.findFirst({
        where: { userId, postId },
      });

      let reputationDelta = 0;

      if (existingVote) {
        if (existingVote.value === value) {
          await tx.vote.delete({
            where: { id: existingVote.id },
          });

          await tx.post.update({
            where: { id: postId },
            data:
                value === 1
                    ? { upvotes: { decrement: 1 } }
                    : { downvotes: { decrement: 1 } },
          });

          reputationDelta = -this.postVoteRep(value);
          await applyUserScoreDelta(tx, post.authorId, reputationDelta, 0);
          await syncUserRoleAndBan(tx, post.authorId);

          return { message: 'Głos usunięty' };
        }

        await tx.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });

        await tx.post.update({
          where: { id: postId },
          data:
              existingVote.value === 1 && value === -1
                  ? {
                    upvotes: { decrement: 1 },
                    downvotes: { increment: 1 },
                  }
                  : {
                    upvotes: { increment: 1 },
                    downvotes: { decrement: 1 },
                  },
        });

        reputationDelta =
            this.postVoteRep(value) - this.postVoteRep(existingVote.value);

        await applyUserScoreDelta(tx, post.authorId, reputationDelta, 0);
        await syncUserRoleAndBan(tx, post.authorId);

        return { message: 'Głos zmieniony' };
      }

      await tx.vote.create({
        data: { userId, postId, value },
      });

      await tx.post.update({
        where: { id: postId },
        data:
            value === 1
                ? { upvotes: { increment: 1 } }
                : { downvotes: { increment: 1 } },
      });

      reputationDelta = this.postVoteRep(value);
      await applyUserScoreDelta(tx, post.authorId, reputationDelta, 0);
      await syncUserRoleAndBan(tx, post.authorId);

      return { message: 'Głos dodany' };
    });
  }

  async voteOnComment(userId: string, commentId: string, value: number) {
    if (value !== 1 && value !== -1) {
      throw new BadRequestException('Vote value must be 1 or -1');
    }

    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.findUnique({
        where: { id: commentId },
        select: {
          id: true,
          authorId: true,
          isActive: true,
        },
      });

      if (!comment || !comment.isActive) {
        throw new NotFoundException('Comment not found');
      }

      const existingVote = await tx.vote.findFirst({
        where: {
          userId,
          postId: null,
          commentId,
        },
      });

      let reputationDelta = 0;

      if (existingVote && existingVote.value === value) {
        await tx.vote.delete({
          where: { id: existingVote.id },
        });

        await tx.comment.update({
          where: { id: commentId },
          data:
              value === 1
                  ? { upvotes: { decrement: 1 } }
                  : { downvotes: { decrement: 1 } },
        });

        reputationDelta = -this.commentVoteRep(value);
        await applyUserScoreDelta(tx, comment.authorId, reputationDelta, 0);
        await syncUserRoleAndBan(tx, comment.authorId);

        return this.getCommentWithRelations(commentId);
      }

      if (existingVote) {
        await tx.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });

        await tx.comment.update({
          where: { id: commentId },
          data:
              existingVote.value === 1 && value === -1
                  ? {
                    upvotes: { decrement: 1 },
                    downvotes: { increment: 1 },
                  }
                  : {
                    upvotes: { increment: 1 },
                    downvotes: { decrement: 1 },
                  },
        });

        reputationDelta =
            this.commentVoteRep(value) - this.commentVoteRep(existingVote.value);

        await applyUserScoreDelta(tx, comment.authorId, reputationDelta, 0);
        await syncUserRoleAndBan(tx, comment.authorId);

        return this.getCommentWithRelations(commentId);
      }

      await tx.vote.create({
        data: {
          userId,
          commentId,
          value,
        },
      });

      await tx.comment.update({
        where: { id: commentId },
        data:
            value === 1
                ? { upvotes: { increment: 1 } }
                : { downvotes: { increment: 1 } },
      });

      reputationDelta = this.commentVoteRep(value);
      await applyUserScoreDelta(tx, comment.authorId, reputationDelta, 0);
      await syncUserRoleAndBan(tx, comment.authorId);

      return this.getCommentWithRelations(commentId);
    });
  }
}