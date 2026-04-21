import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../common/decorators/user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('uploads')
export class UploadsController {
  constructor(
    private uploadsService: UploadsService,
    private prisma: PrismaService,
  ) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
      @UploadedFile() file: Express.Multer.File,
      @UserId() userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file! Verify that FormData is sending correctly.');
    }
    const url = await this.uploadsService.uploadImage(file, `posts/${userId}`);
    return { url };
  }

  @Post('images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultiple(
      @UploadedFiles() files: Express.Multer.File[],
      @UserId() userId: string,
  ) {
    const urls = await this.uploadsService.uploadMultiple(files, `posts/${userId}`);
    return { urls };
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file')) 
  async uploadAvatar(
      @UploadedFile() file: Express.Multer.File,
      @Request() req: any, 
  ) {
    if (!file) {
      throw new BadRequestException('No file! Verify that FormData is sending correctly.');
    }

    try {
      const prismaUserId = req.user.id;

      const url = await this.uploadsService.uploadImage(file, `avatars/${prismaUserId}`);

      await this.prisma.user.update({
        where: { id: prismaUserId },
        data: { avatar: url },
      });

      console.log('Saved a new avatar in the database:', url);
      
      return { url, avatar: url }; 
    } catch (error) {
      console.error('Error during upload in the controller:', error);
      throw error;
    }
  }
}