import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapApp, cleanupDb, createUserWithAuth, uid } from './test-helpers';

describe('PostsController (e2e)', () => {
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

    it('should reject create post without token', async () => {
        const category = await createCategory();
        const city = await createCity();
        await request(app.getHttpServer()).post('/posts').send({ title: 'A', description: 'B', categoryId: category.id, cityId: city.id, latitude: 53.1, longitude: 18.0 }).expect(401);
    });

    it('should create post for authenticated user', async () => {
        const auth = await createUserWithAuth(prisma);
        const category = await createCategory();
        const city = await createCity();

        const res = await request(app.getHttpServer())
            .post('/posts')
            .set('Authorization', `Bearer ${auth.token}`)
            .send({ title: 'Nowy post', description: 'Opis', categoryId: category.id, cityId: city.id, latitude: 53.1235, longitude: 18.0084, imageUrl: null, images: [] })
            .expect(201);

        expect(res.body.authorId).toBe(auth.user.id);
        expect(res.body.title).toBe('Nowy post');
    });

    it('should return post by id', async () => {
        const author = await createUserWithAuth(prisma);
        const category = await createCategory();
        const city = await createCity();
        const post = await seedPost({ authorId: author.user.id, categoryId: category.id, cityId: city.id, title: 'Seed title' });
        const res = await request(app.getHttpServer()).get(`/posts/${post.id}`).expect(200);
        expect(res.body.id).toBe(post.id);
        expect(res.body.author.id).toBe(author.user.id);
        expect(res.body.category.id).toBe(category.id);
    });

    it('should return only active posts from selected city', async () => {
        const author = await createUserWithAuth(prisma);
        const category = await createCategory();
        const cityA = await createCity();
        const cityB = await createCity();
        const visible = await seedPost({ authorId: author.user.id, categoryId: category.id, cityId: cityA.id, isActive: true });
        await seedPost({ authorId: author.user.id, categoryId: category.id, cityId: cityA.id, isActive: false });
        await seedPost({ authorId: author.user.id, categoryId: category.id, cityId: cityB.id, isActive: true });
        const res = await request(app.getHttpServer()).get(`/posts/city/${cityA.id}`).expect(200);
        expect(res.body.map((x: any) => x.id)).toEqual([visible.id]);
    });

    it('should update and delete own post', async () => {
        const author = await createUserWithAuth(prisma);
        const other = await createUserWithAuth(prisma);
        const category = await createCategory();
        const city = await createCity();
        const post = await seedPost({ authorId: author.user.id, categoryId: category.id, cityId: city.id });

        await request(app.getHttpServer()).put(`/posts/${post.id}`).set('Authorization', `Bearer ${other.token}`).send({ title: 'Nope' }).expect(403);
        const updateRes = await request(app.getHttpServer()).put(`/posts/${post.id}`).set('Authorization', `Bearer ${author.token}`).send({ title: 'Updated title' }).expect(200);
        expect(updateRes.body.title).toBe('Updated title');

        await request(app.getHttpServer()).delete(`/posts/${post.id}`).set('Authorization', `Bearer ${other.token}`).expect(403);
        await request(app.getHttpServer()).delete(`/posts/${post.id}`).set('Authorization', `Bearer ${author.token}`).expect(200);
        const dbPost = await prisma.post.findUnique({ where: { id: post.id } });
        expect(dbPost).toBeNull();
    });
});
