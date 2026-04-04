import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapApp, cleanupDb, createUserWithAuth, uid } from './test-helpers';

describe('CommentsController (e2e)', () => {
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
    const seedComment = async (params: any) => prisma.comment.create({ data: { content: 'Seed comment', parentId: null, upvotes: 0, downvotes: 0, ...params } });

    it('should create top-level comment and reply', async () => {
        const author = await createUserWithAuth(prisma);
        const replier = await createUserWithAuth(prisma);
        const category = await createCategory();
        const city = await createCity();
        const post = await seedPost({ authorId: author.user.id, categoryId: category.id, cityId: city.id });

        const top = await request(app.getHttpServer())
            .post('/comments')
            .set('Authorization', `Bearer ${author.token}`)
            .send({ postId: post.id, content: 'Top comment' })
            .expect(201);

        expect(top.body.postId).toBe(post.id);
        expect(top.body.authorId).toBe(author.user.id);

        const reply = await request(app.getHttpServer())
            .post('/comments')
            .set('Authorization', `Bearer ${replier.token}`)
            .send({ postId: post.id, parentId: top.body.id, content: 'Reply comment' })
            .expect(201);

        expect(reply.body.parentId).toBe(top.body.id);
    });

    it('should return top-level comments with replies', async () => {
        const author = await createUserWithAuth(prisma);
        const category = await createCategory();
        const city = await createCity();
        const post = await seedPost({ authorId: author.user.id, categoryId: category.id, cityId: city.id });
        const top = await seedComment({ authorId: author.user.id, postId: post.id, content: 'Top' });
        await seedComment({ authorId: author.user.id, postId: post.id, content: 'Reply', parentId: top.id });

        const res = await request(app.getHttpServer()).get(`/comments/post/${post.id}`).expect(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(top.id);
        expect(Array.isArray(res.body[0].replies)).toBe(true);
        expect(res.body[0].replies).toHaveLength(1);
    });

    it('should update and delete own comment only', async () => {
        const author = await createUserWithAuth(prisma);
        const other = await createUserWithAuth(prisma);
        const category = await createCategory();
        const city = await createCity();
        const post = await seedPost({ authorId: author.user.id, categoryId: category.id, cityId: city.id });
        const comment = await seedComment({ authorId: author.user.id, postId: post.id, content: 'Old content' });

        await request(app.getHttpServer()).put(`/comments/${comment.id}`).set('Authorization', `Bearer ${other.token}`).send({ content: 'Nope' }).expect(403);
        const updateRes = await request(app.getHttpServer()).put(`/comments/${comment.id}`).set('Authorization', `Bearer ${author.token}`).send({ content: 'Updated' }).expect(200);
        expect(updateRes.body.content).toBe('Updated');

        await request(app.getHttpServer()).delete(`/comments/${comment.id}`).set('Authorization', `Bearer ${other.token}`).expect(403);
        await request(app.getHttpServer()).delete(`/comments/${comment.id}`).set('Authorization', `Bearer ${author.token}`).expect(200);

        const commentInDb = await prisma.comment.findUnique({ where: { id: comment.id } });
        expect(commentInDb).toBeNull();
    });
});
