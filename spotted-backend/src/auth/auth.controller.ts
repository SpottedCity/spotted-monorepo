import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {} 

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    const fullProfile = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        reputation: true,
        selectedCity: true,
      },
    });

    return fullProfile;
  }
}