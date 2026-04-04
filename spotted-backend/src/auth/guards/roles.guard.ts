import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const handler = context.getHandler();
        const controller = context.getClass();

        const requiredRoles =
            Reflect.getMetadata(ROLES_KEY, handler) ??
            Reflect.getMetadata(ROLES_KEY, controller);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user as { id?: string; email?: string; role?: UserRole } | undefined;

        if (!user) {
            throw new ForbiddenException('Brak użytkownika w request');
        }

        if (!user.role) {
            throw new ForbiddenException('Brak roli użytkownika');
        }

        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException('Brak uprawnień');
        }

        return true;
    }
}