import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        role: true,
        reputationScore: true,
        penaltyPoints: true,
        moderatorSince: true,
        selectedCityId: true,
        reputation: true,
        createdAt: true,
        isBanned: true,
        bannedAt: true,
        bannedReason: true,
      },
    });
  }

  async updateUserProfile(userId: string, updateUserDto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isBanned: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (existing.isBanned) {
      throw new ForbiddenException('Your account is banned');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        role: true,
        reputationScore: true,
        penaltyPoints: true,
        moderatorSince: true,
        selectedCityId: true,
        isBanned: true,
        bannedAt: true,
        bannedReason: true,
      },
    });
  }

  async getUserReputation(userId: string) {
    return this.prisma.userReputation.findUnique({
      where: { userId },
    });
  }

  async getUserPosts(userId: string, limit = 10, skip = 0) {
    return this.prisma.post.findMany({
      where: { authorId: userId },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        latitude: true,
        longitude: true,
        category: true,
        imageUrl: true,
        upvotes: true,
        downvotes: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminBanUser(targetUserId: string, adminId: string, reason?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Admin cannot ban another admin');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        bannedReason: reason || 'Banned by admin',
        bannedById: adminId,
        role: UserRole.USER,
        moderatorSince: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isBanned: true,
        bannedAt: true,
        bannedReason: true,
      },
    });
  }

  async adminUnbanUser(targetUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        isBanned: false,
        bannedAt: null,
        bannedReason: null,
        bannedById: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isBanned: true,
        bannedAt: true,
        bannedReason: true,
      },
    });
  }
}