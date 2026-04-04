import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Request,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../common/decorators/user.decorator';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminBanUserDto } from './dto/admin-ban-user.dto';
import { NotBannedGuard } from '../auth/guards/not-banned.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return this.usersService.getUserProfile(id);
  }

  @Get(':id/reputation')
  async getUserReputation(@Param('id') id: string) {
    return this.usersService.getUserReputation(id);
  }

  @Get(':id/posts')
  async getUserPosts(
      @Param('id') id: string,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
  ) {
    return this.usersService.getUserPosts(id, limit, skip);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, NotBannedGuard)
  async updateUserProfile(
      @Param('id') id: string,
      @Body() updateUserDto: UpdateUserDto,
      @Request() req: any,
  ) {
    const loggedInUserId = req.user.id;
    const loggedInSupabaseId = req.user.supabaseId || req.user.sub;

    if (id !== loggedInUserId && id !== loggedInSupabaseId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return this.usersService.updateUserProfile(loggedInUserId, updateUserDto);
  }

  @Post(':id/ban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminBanUser(
      @Param('id') id: string,
      @Body() body: AdminBanUserDto,
      @UserId() adminId: string,
  ) {
    return this.usersService.adminBanUser(id, adminId, body?.reason);
  }

  @Post(':id/unban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminUnbanUser(@Param('id') id: string) {
    return this.usersService.adminUnbanUser(id);
  }
}