import * as request from 'supertest';
import { bootstrapApp, cleanupDb, createSupabaseToken, createUserWithAuth } from './test-helpers';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App/Auth (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        ({ app, prisma } = await bootstrapApp());
    });

    beforeEach(async () => {
        await cleanupDb(prisma);
    });

    afterAll(async () => {
        await app.close();
    });

    it('/ (GET)', () => {
        return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
    });

    describe('GET /auth/me', () => {
        it('should reject request without token', async () => {
            await request(app.getHttpServer()).get('/auth/me').expect(401);
        });

        it('should return current profile for authenticated user', async () => {
            const auth = await createUserWithAuth(prisma, {
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
            });

            const res = await request(app.getHttpServer())
                .get('/auth/me')
                .set('Authorization', `Bearer ${auth.token}`)
                .expect(200);

            expect(res.body.id).toBe(auth.user.id);
            expect(res.body.email).toBe('test@example.com');
            expect(res.body.firstName).toBe('Test');
            expect(res.body.lastName).toBe('User');
            expect(res.body.reputation).toBeDefined();
        });

        it('should JIT-create user from valid Supabase-style JWT', async () => {
            const token = createSupabaseToken({
                sub: 'supabase-user-1',
                email: 'jit@example.com',
                user_metadata: { given_name: 'Jit', family_name: 'User', email_verified: true },
            });

            const res = await request(app.getHttpServer())
                .get('/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body.email).toBe('jit@example.com');
            expect(res.body.firstName).toBe('Jit');
            expect(res.body.lastName).toBe('User');

            const dbUser = await prisma.user.findUnique({
                where: { email: 'jit@example.com' },
                include: { reputation: true },
            });

            expect(dbUser).toBeDefined();
            expect(dbUser?.supabaseId).toBe('supabase-user-1');
            expect(dbUser?.reputation).toBeDefined();
        });
    });
});
