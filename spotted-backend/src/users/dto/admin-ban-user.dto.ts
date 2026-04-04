import { IsOptional, IsString } from 'class-validator';

export class AdminBanUserDto {
    @IsOptional()
    @IsString()
    reason?: string;
}