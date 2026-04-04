import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { CommentModerationStatus, FlagReason, PostModerationStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapApp, cleanupDb, createUserWithAuth, uid } from './test-helpers';

describe('Moderation/Admin endpoints (e2e)', () => {
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

    const createCategory = async () => prisma.category.create({ data: { name: `Kategoria-${uid()}`, slug: `kategoria-${uid()}`, color: '#ff0000', icon: 'alert-circle' } });
    const createCity = async () => prisma.city.create({ data: { name: `Miasto-${uid()}`, voivodeship: 'kujawsko-pomorskie', latitude: 53.1235, longitude: 18.0084 } });
    const seedPost = async (params: any) => prisma.post.create({ data: { title: 'Seed post', description: 'Seed description', latitude: 53.1235, longitude: 18.0084, imageUrl: null, images: [], isActive: true, upvotes: 0, downvotes: 0, ...params } });
    const seedComment = async (params: any) => prisma.comment.create({ data: { content: 'Seed comment', parentId: null, upvotes: 0, downvotes: 0, isActive: true, ...params } });

    it('should allow admin to ban and unban non-admin user', async () => {
        const admin = await createUserWithAuth(prisma, { role: UserRole.ADMIN });
        const target = await createUserWithAuth(prisma);

        const banRes = await request(app.getHttpServer())
            .post(`/users/${target.user.id}/ban`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ reason: 'Manual admin ban' })
            .expect(201);

        expect(banRes.body.isBanned).toBe(true);
        expect(banRes.body.bannedReason).toBe('Manual admin ban');

        const unbanRes = await request(app.getHttpServer())
            .post(`/users/${target.user.id}/unban`)
            .set('Authorization', `Bearer ${admin.token}`)
            .expect(201);

        expect(unbanRes.body.isBanned).toBe(false);
    });

    it('should reject banning another admin', async () => {
        const adminA = await createUserWithAuth(prisma, { role: UserRole.ADMIN });
        const adminB = await createUserWithAuth(prisma, { role: UserRole.ADMIN });

        await request(app.getHttpServer())
            .post(`/users/${adminB.user.id}/ban`)
            .set('Authorization', `Bearer ${adminA.token}`)
            .send({ reason: 'nope' })
            .expect(403);
    });

    it('should reject regular user from moderation queue', async () => {
        const user = await createUserWithAuth(prisma);
        await request(app.getHttpServer()).get('/moderation/queue').set('Authorization', `Bearer ${user.token}`).expect(403);
    });

    it('should return pending flags for moderator', async () => {
        const owner = await createUserWithAuth(prisma);
        const reporter = await createUserWithAuth(prisma);
        const moderator = await createUserWithAuth(prisma, { role: UserRole.MODERATOR });
        const category = await createCategory();
        const city = await createCity();
        const post = await seedPost({ authorId: owner.user.id, categoryId: category.id, cityId: city.id });
        await prisma.flag.create({ data: { reporterId: reporter.user.id, postId: post.id, reason: FlagReason.SPAM } });

        const res = await request(app.getHttpServer()).get('/moderation/queue').set('Authorization', `Bearer ${moderator.token}`).expect(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].postId).toBe(post.id);
    });

    it('should allow moderator to remove and restore post', async () => {
        const owner = await createUserWithAuth(prisma);
        const moderator = await createUserWithAuth(prisma, { role: UserRole.MODERATOR });
        const category = await createCategory();
        const city = await createCity();
        const post = await seedPost({ authorId: owner.user.id, categoryId: category.id, cityId: city.id });

        const removeRes = await request(app.getHttpServer())
            .post(`/moderation/posts/${post.id}/remove`)
            .set('Authorization', `Bearer ${moderator.token}`)
            .send({ reason: 'Spam' })
            .expect(201);

        expect(removeRes.body.isActive).toBe(false);
        expect(removeRes.body.moderationStatus).toBe(PostModerationStatus.REMOVED_BY_MODERATOR);

        const restoreRes = await request(app.getHttpServer())
            .post(`/moderation/posts/${post.id}/restore`)
            .set('Authorization', `Bearer ${moderator.token}`)
            .send({ reason: 'Ok now' })
            .expect(201);

        expect(restoreRes.body.isActive).toBe(true);
        expect(restoreRes.body.moderationStatus).toBe(PostModerationStatus.RESTORED);
    });

    it('should allow moderator to remove and restore comment', async () => {
        const owner = await createUserWithAuth(prisma);
        const moderator = await createUserWithAuth(prisma, { role: UserRole.MODERATOR });
        const category = await createCategory();
        const city = await createCity();
        const post = await seedPost({ authorId: owner.user.id, categoryId: category.id, cityId: city.id });
        const comment = await seedComment({ authorId: owner.user.id, postId: post.id, content: 'Comment' });

        const removeRes = await request(app.getHttpServer())
            .post(`/moderation/comments/${comment.id}/remove`)
            .set('Authorization', `Bearer ${moderator.token}`)
            .send({ reason: 'Abuse' })
            .expect(201);

        expect(removeRes.body.isActive).toBe(false);
        expect(removeRes.body.moderationStatus).toBe(CommentModerationStatus.REMOVED_BY_MODERATOR);

        const restoreRes = await request(app.getHttpServer())
            .post(`/moderation/comments/${comment.id}/restore`)
            .set('Authorization', `Bearer ${moderator.token}`)
            .send({ reason: 'Fine' })
            .expect(201);

        expect(restoreRes.body.isActive).toBe(true);
        expect(restoreRes.body.moderationStatus).toBe(CommentModerationStatus.RESTORED);
    });
});
