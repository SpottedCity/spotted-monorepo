import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapApp, cleanupDb, createUserWithAuth, uid } from './test-helpers';

describe('VotesController (e2e)', () => {
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
    const seedPost = async (params: { authorId: string; categoryId: string; cityId: string }) => prisma.post.create({ data: { title: 'Seed post', description: 'Seed description', latitude: 53.1235, longitude: 18.0084, imageUrl: null, images: [], isActive: true, upvotes: 0, downvotes: 0, ...params } });
    const seedComment = async (params: { authorId: string; postId: string; content: string }) => prisma.comment.create({ data: { parentId: null, upvotes: 0, downvotes: 0, ...params } });

    it('should create and remove post upvote', async () => {
        const owner = await createUserWithAuth(prisma);
        const voter = await createUserWithAuth(prisma);
        const category = await createCategory();
        const city = await createCity();
        const post = await seedPost({ authorId: owner.user.id, categoryId: category.id, cityId: city.id });

        await request(app.getHttpServer())
            .post(`/votes/post/${post.id}`)
            .set('Authorization', `Bearer ${voter.token}`)
            .send({ value: 1 })
            .expect(201);

        let postInDb = await prisma.post.findUnique({ where: { id: post.id } });
        expect(postInDb?.upvotes).toBe(1);
        expect(postInDb?.downvotes).toBe(0);

        await request(app.getHttpServer())
            .post(`/votes/post/${post.id}`)
            .set('Authorization', `Bearer ${voter.token}`)
            .send({ value: 1 })
            .expect(201);

        postInDb = await prisma.post.findUnique({ where: { id: post.id } });
        expect(postInDb?.upvotes).toBe(0);
        expect(postInDb?.downvotes).toBe(0);
    });

    it('should switch post vote from upvote to downvote', async () => {
        const owner = await createUserWithAuth(prisma);
        const voter = await createUserWithAuth(prisma);
        const category = await createCategory();
        const city = await createCity();
        const post = await seedPost({ authorId: owner.user.id, categoryId: category.id, cityId: city.id });

        await request(app.getHttpServer()).post(`/votes/post/${post.id}`).set('Authorization', `Bearer ${voter.token}`).send({ value: 1 }).expect(201);
        await request(app.getHttpServer()).post(`/votes/post/${post.id}`).set('Authorization', `Bearer ${voter.token}`).send({ value: -1 }).expect(201);

        const postInDb = await prisma.post.findUnique({ where: { id: post.id } });
        expect(postInDb?.upvotes).toBe(0);
        expect(postInDb?.downvotes).toBe(1);
    });

    it('should reject invalid vote value on post', async () => {
        const owner = await createUserWithAuth(prisma);
        const voter = await createUserWithAuth(prisma);
        const category = await createCategory();
        const city = await createCity();
        const post = await seedPost({ authorId: owner.user.id, categoryId: category.id, cityId: city.id });

        await request(app.getHttpServer())
            .post(`/votes/post/${post.id}`)
            .set('Authorization', `Bearer ${voter.token}`)
            .send({ value: 2 })
            .expect(400);
    });

    it('should create and switch comment vote', async () => {
        const owner = await createUserWithAuth(prisma);
        const voter = await createUserWithAuth(prisma);
        const category = await createCategory();
        const city = await createCity();
        const post = await seedPost({ authorId: owner.user.id, categoryId: category.id, cityId: city.id });
        const comment = await seedComment({ authorId: owner.user.id, postId: post.id, content: 'Hello' });

        const firstRes = await request(app.getHttpServer())
            .post(`/votes/comment/${comment.id}`)
            .set('Authorization', `Bearer ${voter.token}`)
            .send({ value: -1 })
            .expect(201);

        expect(firstRes.body.id).toBe(comment.id);

        let dbComment = await prisma.comment.findUnique({
            where: { id: comment.id },
        });

        expect(dbComment).toBeTruthy();
        expect(dbComment?.downvotes).toBe(1);
        expect(dbComment?.upvotes).toBe(0);

        const secondRes = await request(app.getHttpServer())
            .post(`/votes/comment/${comment.id}`)
            .set('Authorization', `Bearer ${voter.token}`)
            .send({ value: 1 })
            .expect(201);

        expect(secondRes.body.id).toBe(comment.id);

        dbComment = await prisma.comment.findUnique({
            where: { id: comment.id },
        });

        expect(dbComment).toBeTruthy();
        expect(dbComment?.downvotes).toBe(0);
        expect(dbComment?.upvotes).toBe(1);
    });
});
