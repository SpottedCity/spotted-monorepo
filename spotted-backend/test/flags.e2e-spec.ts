import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { FlagStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapApp, cleanupDb, createUserWithAuth, uid } from './test-helpers';

describe('FlagsController (e2e)', () => {
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

    const createCategory = async () => prisma.category.create({ data: { name: `Awarie-${uid()}`, slug: `awarie-${uid()}`, color: '#ff0000', icon: 'alert-circle' } });
    const createCity = async () => prisma.city.create({ data: { name: `Miasto-${uid()}`, voivodeship: 'kujawsko-pomorskie', latitude: 53.1235, longitude: 18.0084 } });
    const seedPost = async (params: any) => prisma.post.create({ data: { title: 'Seed post', description: 'Seed description', latitude: 53.1235, longitude: 18.0084, imageUrl: null, images: [], isActive: true, upvotes: 0, downvotes: 0, ...params } });

    it('should create post flag and reject duplicate', async () => {
        const owner = await createUserWithAuth(prisma);
        const reporter = await createUserWithAuth(prisma);
        const category = await createCategory();
        const city = await createCity();
        const post = await seedPost({ authorId: owner.user.id, categoryId: category.id, cityId: city.id });

        await request(app.getHttpServer()).post('/flags').send({ postId: post.id, reason: 'SPAM' }).expect(401);

        await request(app.getHttpServer())
            .post('/flags')
            .set('Authorization', `Bearer ${reporter.token}`)
            .send({ postId: post.id, reason: 'SPAM', description: 'Suspicious content' })
            .expect(201);

        await request(app.getHttpServer())
            .post('/flags')
            .set('Authorization', `Bearer ${reporter.token}`)
            .send({ postId: post.id, reason: 'SPAM' })
            .expect(400);
    });

    it('should list flags for moderator and filter by status', async () => {
        const owner = await createUserWithAuth(prisma);
        const reporter1 = await createUserWithAuth(prisma);
        const reporter2 = await createUserWithAuth(prisma);
        const moderator = await createUserWithAuth(prisma, { role: UserRole.MODERATOR });
        const category = await createCategory();
        const city = await createCity();
        const post = await seedPost({ authorId: owner.user.id, categoryId: category.id, cityId: city.id });

        await prisma.flag.createMany({
            data: [
                { reporterId: reporter1.user.id, postId: post.id, reason: 'SPAM', status: FlagStatus.PENDING },
                { reporterId: reporter2.user.id, postId: post.id, reason: 'SPAM', status: FlagStatus.DISMISSED },
            ],
        });

        const allPending = await request(app.getHttpServer())
            .get('/flags?status=PENDING')
            .set('Authorization', `Bearer ${moderator.token}`)
            .expect(200);

        expect(allPending.body).toHaveLength(1);
        expect(allPending.body[0].status).toBe('PENDING');

        const byPost = await request(app.getHttpServer())
            .get(`/flags/post/${post.id}`)
            .set('Authorization', `Bearer ${moderator.token}`)
            .expect(200);

        expect(byPost.body).toHaveLength(2);
    });

    it('should resolve flag and disable post', async () => {
        const owner = await createUserWithAuth(prisma);
        const reporter = await createUserWithAuth(prisma);
        const moderator = await createUserWithAuth(prisma, { role: UserRole.MODERATOR });
        const category = await createCategory();
        const city = await createCity();
        const post = await seedPost({ authorId: owner.user.id, categoryId: category.id, cityId: city.id });
        const flag = await prisma.flag.create({ data: { reporterId: reporter.user.id, postId: post.id, reason: 'SPAM' } });

        const res = await request(app.getHttpServer())
            .patch(`/flags/${flag.id}`)
            .set('Authorization', `Bearer ${moderator.token}`)
            .send({ status: 'RESOLVED' })
            .expect(200);

        expect(res.body.status).toBe('RESOLVED');
        const postInDb = await prisma.post.findUnique({ where: { id: post.id } });
        expect(postInDb?.isActive).toBe(false);
    });
});
