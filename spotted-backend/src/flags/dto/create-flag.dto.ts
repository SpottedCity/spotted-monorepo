import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FlagReason } from '@prisma/client';

export class CreateFlagDto {
  @IsOptional()
  @IsString()
  postId?: string;

  @IsOptional()
  @IsString()
  commentId?: string;

  @IsEnum(FlagReason)
  reason: FlagReason;

  @IsOptional()
  @IsString()
  description?: string;
}