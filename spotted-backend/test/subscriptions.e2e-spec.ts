import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapApp, cleanupDb, createUserWithAuth, uid } from './test-helpers';

describe('SubscriptionsController (e2e)', () => {
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

    it('should subscribe authenticated user to category and post', async () => {
        const auth = await createUserWithAuth(prisma);
        const author = await createUserWithAuth(prisma);
        const category = await createCategory();
        const city = await createCity();
        const post = await seedPost({ authorId: author.user.id, categoryId: category.id, cityId: city.id });

        await request(app.getHttpServer()).post('/subscriptions').send({ categoryId: category.id }).expect(401);

        const categorySub = await request(app.getHttpServer())
            .post('/subscriptions')
            .set('Authorization', `Bearer ${auth.token}`)
            .send({ categoryId: category.id })
            .expect(201);

        const postSub = await request(app.getHttpServer())
            .post('/subscriptions')
            .set('Authorization', `Bearer ${auth.token}`)
            .send({ postId: post.id })
            .expect(201);

        expect(categorySub.body.categoryId).toBe(category.id);
        expect(postSub.body.postId).toBe(post.id);
    });

    it('should list and delete own subscriptions', async () => {
        const auth = await createUserWithAuth(prisma);
        const category = await createCategory();
        const sub = await prisma.subscription.create({ data: { userId: auth.user.id, categoryId: category.id } });

        const listRes = await request(app.getHttpServer()).get('/subscriptions').set('Authorization', `Bearer ${auth.token}`).expect(200);
        expect(listRes.body).toHaveLength(1);
        expect(listRes.body[0].id).toBe(sub.id);

        await request(app.getHttpServer()).delete(`/subscriptions/${sub.id}`).set('Authorization', `Bearer ${auth.token}`).expect(200);
        const deleted = await prisma.subscription.findUnique({ where: { id: sub.id } });
        expect(deleted).toBeNull();
    });
});
