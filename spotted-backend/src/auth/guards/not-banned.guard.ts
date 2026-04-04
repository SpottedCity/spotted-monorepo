import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotBannedGuard implements CanActivate {
    constructor(private prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user?.sub && !user?.id) {
            return true;
        }

        const userId = user.sub || user.id;

        const dbUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                isBanned: true,
            },
        });

        if (dbUser?.isBanned) {
            throw new ForbiddenException('Your account is banned');
        }

        return true;
    }
}