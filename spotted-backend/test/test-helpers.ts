import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

export const TEST_JWT_SECRET = 'test-secret';

export function setupTestEnv() {
    process.env.NODE_ENV = 'test';
    process.env.SUPABASE_JWT_SECRET = TEST_JWT_SECRET;
    process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-service-role-key';
}

export async function bootstrapApp(overrides?: (builder: ReturnType<typeof Test.createTestingModule>) => ReturnType<typeof Test.createTestingModule>) {
    setupTestEnv();
    const builder = Test.createTestingModule({ imports: [AppModule] });
    const finalBuilder = overrides ? overrides(builder) : builder;
    const moduleFixture: TestingModule = await finalBuilder.compile();
    const app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    const prisma = moduleFixture.get<PrismaService>(PrismaService);
    return { app, prisma, moduleFixture };
}

export async function cleanupDb(prisma: PrismaService) {
    await prisma.subscription.deleteMany();
    await prisma.flag.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.category.deleteMany();
    await prisma.city.deleteMany();
    await prisma.userReputation.deleteMany();
    await prisma.user.deleteMany();
}

export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function createSupabaseToken(params: {
    sub: string;
    email: string;
    role?: string;
    user_metadata?: Record<string, any>;
    identity_data?: Record<string, any>;
}) {
    const payload = {
        sub: params.sub,
        email: params.email,
        role: params.role ?? 'authenticated',
        aud: 'authenticated',
        user_metadata: params.user_metadata ?? {},
        identity_data: params.identity_data ?? {},
    };
    return jwt.sign(payload, TEST_JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
}

export async function createUserWithAuth(
    prisma: PrismaService,
    overrides?: Partial<{
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: UserRole;
        reputationScore: number;
        penaltyPoints: number;
        isBanned: boolean;
        avatar: string | null;
        bio: string | null;
    }>,
) {
    const n = uid();
    const email = overrides?.email ?? `user-${n}@example.com`;
    const sub = `sb-${n}`;
    const user = await prisma.user.create({
        data: {
            email,
            supabaseId: sub,
            firstName: overrides?.firstName ?? 'Jan',
            lastName: overrides?.lastName ?? 'Testowy',
            role: overrides?.role ?? UserRole.USER,
            reputationScore: overrides?.reputationScore ?? 0,
            penaltyPoints: overrides?.penaltyPoints ?? 0,
            isBanned: overrides?.isBanned ?? false,
            avatar: overrides?.avatar ?? null,
            bio: overrides?.bio ?? null,
            emailVerified: true,
            reputation: { create: {} },
        },
        include: { reputation: true },
    });

    const token = createSupabaseToken({
        sub,
        email,
        user_metadata: {
            given_name: user.firstName ?? undefined,
            family_name: user.lastName ?? undefined,
            avatar_url: user.avatar ?? undefined,
            email_verified: true,
        },
    });

    return { user, token };
}
