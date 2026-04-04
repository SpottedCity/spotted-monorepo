import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  applyUserScoreDelta,
  syncUserRoleAndBan,
} from '../common/reputation/reputation.helpers';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async createComment(authorId: string, createCommentDto: CreateCommentDto) {
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({
        where: { id: createCommentDto.postId },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!post || !post.isActive) {
        throw new NotFoundException('Post not found');
      }

      if (createCommentDto.parentId) {
        const parent = await tx.comment.findUnique({
          where: { id: createCommentDto.parentId },
          select: {
            id: true,
            postId: true,
            isActive: true,
          },
        });

        if (!parent || !parent.isActive) {
          throw new NotFoundException('Parent comment not found');
        }

        if (parent.postId !== createCommentDto.postId) {
          throw new BadRequestException('Parent comment belongs to another post');
        }
      }

      const comment = await tx.comment.create({
        data: {
          ...createCommentDto,
          authorId,
        },
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
      });

      await applyUserScoreDelta(tx, authorId, 3, 0);
      await syncUserRoleAndBan(tx, authorId);

      return comment;
    });
  }

  async getCommentsByPost(postId: string, limit = 20, skip = 0) {
    return this.prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
        isActive: true,
      },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        replies: {
          where: {
            isActive: true,
          },
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
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateComment(commentId: string, authorId: string, content: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || !comment.isActive) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== authorId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });
  }

  async deleteComment(commentId: string, authorId: string) {
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

      if (comment.authorId !== authorId) {
        throw new ForbiddenException('You can only delete your own comments');
      }

      const deleted = await tx.comment.delete({
        where: { id: commentId },
      });

      await applyUserScoreDelta(tx, authorId, -3, 0);
      await syncUserRoleAndBan(tx, authorId);

      return deleted;
    });
  }
}