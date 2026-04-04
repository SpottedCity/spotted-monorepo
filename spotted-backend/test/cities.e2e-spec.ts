import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapApp, cleanupDb, createUserWithAuth, uid } from './test-helpers';

describe('CitiesController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    const LIST_ROUTE = '/cities';
    const DETAILS_ROUTE = (id: string) => `/cities/${id}`;
    const VOIVODESHIP_ROUTE = (name: string) => `/cities/voivodeship/${name}`;

    beforeAll(async () => {
        ({ app, prisma } = await bootstrapApp());
    });

    beforeEach(async () => {
        await cleanupDb(prisma);
    });

    afterAll(async () => {
        await app.close();
    });

    const createCityPayload = (overrides?: Partial<{ name: string; voivodeship: string; latitude: number; longitude: number; bounds: Record<string, number> }>) => ({
        name: `Miasto-${uid()}`,
        voivodeship: 'kujawsko-pomorskie',
        latitude: 53.1235,
        longitude: 18.0084,
        ...overrides,
    });

    const seedCity = async (overrides?: Partial<{ name: string; voivodeship: string; latitude: number; longitude: number; bounds: Record<string, number> }>) => (
        prisma.city.create({ data: createCityPayload(overrides) })
    );

    it('GET /cities should return cities list', async () => {
        const c1 = await seedCity({ name: `Bydgoszcz-${uid()}` });
        const c2 = await seedCity({ name: `Toruń-${uid()}` });
        const res = await request(app.getHttpServer()).get(LIST_ROUTE).expect(200);
        expect(res.body.map((x: any) => x.id)).toEqual(expect.arrayContaining([c1.id, c2.id]));
    });

    it('GET /cities/voivodeship/:voivodeship should filter cities', async () => {
        const targetVoivodeship = `pomorskie-${uid()}`;
        const matched = await seedCity({ voivodeship: targetVoivodeship, name: `Gdańsk-${uid()}` });
        await seedCity({ voivodeship: `mazowieckie-${uid()}`, name: `Warszawa-${uid()}` });
        const res = await request(app.getHttpServer()).get(VOIVODESHIP_ROUTE(targetVoivodeship)).expect(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(matched.id);
    });

    it('GET /cities/:id should return city details', async () => {
        const city = await seedCity();
        const res = await request(app.getHttpServer()).get(DETAILS_ROUTE(city.id)).expect(200);
        expect(res.body.id).toBe(city.id);
        expect(res.body.name).toBe(city.name);
    });

    describe('POST /cities', () => {
        it('should reject create without token', async () => {
            await request(app.getHttpServer()).post(LIST_ROUTE).send(createCityPayload()).expect(401);
        });

        it('should reject create for regular user', async () => {
            const auth = await createUserWithAuth(prisma);
            await request(app.getHttpServer())
                .post(LIST_ROUTE)
                .set('Authorization', `Bearer ${auth.token}`)
                .send(createCityPayload())
                .expect(403);
        });

        it('should create city for admin', async () => {
            const admin = await createUserWithAuth(prisma, { role: UserRole.ADMIN });
            const payload = createCityPayload();
            const res = await request(app.getHttpServer())
                .post(LIST_ROUTE)
                .set('Authorization', `Bearer ${admin.token}`)
                .send(payload)
                .expect(201);
            expect(res.body.name).toBe(payload.name);
            const cityInDb = await prisma.city.findUnique({ where: { name: payload.name } });
            expect(cityInDb).toBeDefined();
        });

        it('should reject invalid latitude type for admin', async () => {
            const admin = await createUserWithAuth(prisma, { role: UserRole.ADMIN });
            await request(app.getHttpServer())
                .post(LIST_ROUTE)
                .set('Authorization', `Bearer ${admin.token}`)
                .send({ ...createCityPayload(), latitude: '53.1235' })
                .expect(400);
        });
    });
});
