import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VotesService {
  constructor(private prisma: PrismaService) {}

  async voteOnPost(userId: string, postId: string, value: number) {
    const existingVote = await this.prisma.vote.findFirst({
      where: { userId, postId },
    });

    return this.prisma.$transaction(async (tx) => {
      if (existingVote) {
        if (existingVote.value === value) {
          await tx.vote.delete({ where: { id: existingVote.id } });
          
          await tx.post.update({
            where: { id: postId },
            data: value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
          });
          return { message: 'Głos usunięty' };
          
        } else {
          await tx.vote.update({
            where: { id: existingVote.id },
            data: { value },
          });

          await tx.post.update({
            where: { id: postId },
            data: {
              ...(value === 1 ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } } : {}),
              ...(value === -1 ? { upvotes: { decrement: 1 }, downvotes: { increment: 1 } } : {}),
            },
          });
          return { message: 'Głos zmieniony' };
        }
      } else {
        await tx.vote.create({
          data: { userId, postId, value },
        });

        await tx.post.update({
          where: { id: postId },
          data: value === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
        });
        return { message: 'Głos dodany' };
      }
    });
  }


  async voteOnComment(userId: string, commentId: string, value: number) {
    if (value !== 1 && value !== -1) {
      throw new BadRequestException('Vote value must be 1 or -1');
    }

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // NIE findUnique z nullami, tylko findFirst
    const existingVote = await this.prisma.vote.findFirst({
      where: {
        userId,
        postId: null,
        commentId,
      },
    });

    // toggle off
    if (existingVote && existingVote.value === value) {
      await this.prisma.$transaction([
        this.prisma.vote.delete({
          where: { id: existingVote.id },
        }),
        this.prisma.comment.update({
          where: { id: commentId },
          data:
              value === 1
                  ? { upvotes: { decrement: 1 } }
                  : { downvotes: { decrement: 1 } },
        }),
      ]);

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

    // zmiana głosu
    if (existingVote) {
      await this.prisma.$transaction([
        this.prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        }),
        this.prisma.comment.update({
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
        }),
      ]);

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

    // nowy głos
    await this.prisma.$transaction([
      this.prisma.vote.create({
        data: {
          userId,
          postId: null,
          commentId,
          value,
        },
      }),
      this.prisma.comment.update({
        where: { id: commentId },
        data:
            value === 1
                ? { upvotes: { increment: 1 } }
                : { downvotes: { increment: 1 } },
      }),
    ]);

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
}