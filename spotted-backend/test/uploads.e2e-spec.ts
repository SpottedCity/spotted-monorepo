import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { UploadsService } from '../src/uploads/uploads.service';
import { bootstrapApp, cleanupDb, createUserWithAuth } from './test-helpers';

describe('UploadsController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const fakeUploadsService = {
            uploadImage: jest.fn(async (file: Express.Multer.File, folder: string) => `https://cdn.test.local/${folder}/${file.originalname}`),
            uploadMultiple: jest.fn(async (files: Express.Multer.File[], folder: string) => files.map((file) => `https://cdn.test.local/${folder}/${file.originalname}`)),
        };

        ({ app, prisma } = await bootstrapApp((builder) => builder.overrideProvider(UploadsService).useValue(fakeUploadsService)));
    });

    beforeEach(async () => {
        await cleanupDb(prisma);
    });

    afterAll(async () => {
        await app.close();
    });

    it('POST /uploads/image should reject upload without token', async () => {
        await request(app.getHttpServer())
            .post('/uploads/image')
            .attach('file', Buffer.from('fake-image-content'), 'test-image.png')
            .expect(401);
    });

    it('POST /uploads/image should upload single image for authenticated user', async () => {
        const auth = await createUserWithAuth(prisma);
        const res = await request(app.getHttpServer())
            .post('/uploads/image')
            .set('Authorization', `Bearer ${auth.token}`)
            .attach('file', Buffer.from('fake-image-content'), 'test-image.png')
            .expect(201);

        expect(res.body.url).toBe(`https://cdn.test.local/posts/${auth.user.id}/test-image.png`);
    });

    it('POST /uploads/images should upload multiple images for authenticated user', async () => {
        const auth = await createUserWithAuth(prisma);
        const res = await request(app.getHttpServer())
            .post('/uploads/images')
            .set('Authorization', `Bearer ${auth.token}`)
            .attach('files', Buffer.from('fake-image-a'), 'a.png')
            .attach('files', Buffer.from('fake-image-b'), 'b.png')
            .expect(201);

        expect(res.body.urls).toEqual([
            `https://cdn.test.local/posts/${auth.user.id}/a.png`,
            `https://cdn.test.local/posts/${auth.user.id}/b.png`,
        ]);
    });

    it('POST /uploads/avatar should upload avatar and save it in db', async () => {
        const auth = await createUserWithAuth(prisma);
        const res = await request(app.getHttpServer())
            .post('/uploads/avatar')
            .set('Authorization', `Bearer ${auth.token}`)
            .attach('file', Buffer.from('fake-avatar-content'), 'avatar.jpg')
            .expect(201);

        expect(res.body.url).toBe(`https://cdn.test.local/avatars/${auth.user.id}/avatar.jpg`);
        expect(res.body.avatar).toBe(res.body.url);

        const userInDb = await prisma.user.findUnique({ where: { id: auth.user.id } });
        expect(userInDb?.avatar).toBe(`https://cdn.test.local/avatars/${auth.user.id}/avatar.jpg`);
    });
});
