import { IsEnum } from 'class-validator';
import { FlagStatus } from '@prisma/client';

export class ResolveFlagDto {
    @IsEnum(FlagStatus)
    status: FlagStatus;
}