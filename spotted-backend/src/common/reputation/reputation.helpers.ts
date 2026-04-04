import { Prisma, UserRole } from '@prisma/client';

export const MODERATOR_PROMOTION_SCORE = 2000;
export const MODERATOR_DEMOTION_SCORE = 2000;
export const AUTO_BAN_SCORE = -500;

export async function applyUserScoreDelta(
    tx: Prisma.TransactionClient,
    userId: string,
    reputationDelta = 0,
    penaltyDelta = 0,
) {
    if (!reputationDelta && !penaltyDelta) return;

    await tx.user.update({
        where: { id: userId },
        data: {
            reputationScore: reputationDelta
                ? { increment: reputationDelta }
                : undefined,
            penaltyPoints: penaltyDelta
                ? { increment: penaltyDelta }
                : undefined,
        },
    });
}

export async function syncUserRoleAndBan(
    tx: Prisma.TransactionClient,
    userId: string,
) {
    const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            role: true,
            reputationScore: true,
            isBanned: true,
        },
    });

    if (!user) return;

    if (user.role === UserRole.ADMIN) {
        return;
    }

    if (user.reputationScore < AUTO_BAN_SCORE) {
        await tx.user.update({
            where: { id: user.id },
            data: {
                isBanned: true,
                bannedAt: new Date(),
                bannedReason: 'Automatic ban: reputation below -500',
                role: UserRole.USER,
                moderatorSince: null,
            },
        });
        return;
    }

    if (user.isBanned) {
        return;
    }

    if (user.reputationScore >= MODERATOR_PROMOTION_SCORE) {
        if (user.role !== UserRole.MODERATOR) {
            await tx.user.update({
                where: { id: user.id },
                data: {
                    role: UserRole.MODERATOR,
                    moderatorSince: new Date(),
                },
            });
        }
        return;
    }

    if (user.reputationScore < MODERATOR_DEMOTION_SCORE) {
        if (user.role === UserRole.MODERATOR) {
            await tx.user.update({
                where: { id: user.id },
                data: {
                    role: UserRole.USER,
                    moderatorSince: null,
                },
            });
        }
    }
}