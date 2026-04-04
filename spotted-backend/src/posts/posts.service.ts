import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';
import {
  applyUserScoreDelta,
  syncUserRoleAndBan,
} from '../common/reputation/reputation.helpers';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(authorId: string, createPostDto: CreatePostDto) {
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          ...createPostDto,
          authorId,
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
        },
      });

      await tx.userReputation.update({
        where: { userId: authorId },
        data: { totalPosts: { increment: 1 } },
      });

      await applyUserScoreDelta(tx, authorId, 5, 0);
      await syncUserRoleAndBan(tx, authorId);

      return post;
    });
  }

  async getPostById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            reputation: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        comments: {
          where: {
            isActive: true,
            parentId: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            content: true,
            upvotes: true,
            downvotes: true,
            createdAt: true,
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
              orderBy: {
                createdAt: 'asc',
              },
              select: {
                id: true,
                content: true,
                upvotes: true,
                downvotes: true,
                createdAt: true,
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
          },
        },
      },
    });
  }

  async getPostsByCity(
      cityId: string,
      limit = 20,
      skip = 0,
      categoryId?: string,
  ) {
    return this.prisma.post.findMany({
      where: {
        cityId,
        isActive: true,
        ...(categoryId && { categoryId }),
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
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getNearbyPosts(
      latitude: number,
      longitude: number,
      radiusKm = 5,
      limit = 20,
  ) {
    const posts = await this.prisma.post.findMany({
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
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      take: limit * 2,
    });

    const nearby = posts.filter((post) => {
      const distance = this.calculateDistance(
          latitude,
          longitude,
          post.latitude,
          post.longitude,
      );
      return distance <= radiusKm;
    });

    return nearby.slice(0, limit);
  }

  async updatePost(
      postId: string,
      authorId: string,
      updatePostDto: UpdatePostDto,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: updatePostDto,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async deletePost(postId: string, authorId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.post.delete({
        where: { id: postId },
      });

      await applyUserScoreDelta(tx, authorId, -5, 0);
      await syncUserRoleAndBan(tx, authorId);

      return deleted;
    });
  }

  private calculateDistance(
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number,
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}