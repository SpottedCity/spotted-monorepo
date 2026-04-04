import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapApp, cleanupDb, createUserWithAuth, uid } from './test-helpers';

describe('UsersController (e2e)', () => {
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

    it('should return user profile publicly', async () => {
        const auth = await createUserWithAuth(prisma, { bio: 'Hello there' });
        const res = await request(app.getHttpServer()).get(`/users/${auth.user.id}`).expect(200);
        expect(res.body.id).toBe(auth.user.id);
        expect(res.body.email).toBe(auth.user.email);
        expect(res.body.bio).toBe('Hello there');
    });

    it('should return user reputation', async () => {
        const auth = await createUserWithAuth(prisma);
        const res = await request(app.getHttpServer()).get(`/users/${auth.user.id}/reputation`).expect(200);
        expect(res.body.userId).toBe(auth.user.id);
    });

    it('should return only posts authored by selected user', async () => {
        const author = await createUserWithAuth(prisma);
        const foreign = await createUserWithAuth(prisma);
        const category = await createCategory();
        const city = await createCity();
        const post1 = await seedPost({ authorId: author.user.id, categoryId: category.id, cityId: city.id });
        const post2 = await seedPost({ authorId: author.user.id, categoryId: category.id, cityId: city.id });
        await seedPost({ authorId: foreign.user.id, categoryId: category.id, cityId: city.id });
        const res = await request(app.getHttpServer()).get(`/users/${author.user.id}/posts?limit=50&skip=0`).expect(200);
        expect(res.body.map((x: any) => x.id)).toEqual(expect.arrayContaining([post1.id, post2.id]));
    });

    it('should update own profile and reject updating another user', async () => {
        const owner = await createUserWithAuth(prisma);
        const other = await createUserWithAuth(prisma);

        await request(app.getHttpServer()).put(`/users/${owner.user.id}`).send({ firstName: 'X' }).expect(401);
        await request(app.getHttpServer()).put(`/users/${owner.user.id}`).set('Authorization', `Bearer ${other.token}`).send({ firstName: 'Nope' }).expect(403);

        const res = await request(app.getHttpServer())
            .put(`/users/${owner.user.id}`)
            .set('Authorization', `Bearer ${owner.token}`)
            .send({ firstName: 'NoweImie', bio: 'Nowe bio' })
            .expect(200);

        expect(res.body.firstName).toBe('NoweImie');
        expect(res.body.bio).toBe('Nowe bio');
    });
});
