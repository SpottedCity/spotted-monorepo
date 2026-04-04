import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories = [
    { name: 'Wypadek', slug: 'wypadek', color: '#EF4444', icon: '🚨' },
    {
      name: 'Niebezpieczeństwo',
      slug: 'niebezpieczenstwo',
      color: '#F97316',
      icon: '⚠️',
    },
    { name: 'Policja', slug: 'policja', color: '#3B82F6', icon: '🚔' },
    { name: 'Usterka', slug: 'usterka', color: '#8B5CF6', icon: '🔧' },
    { name: 'Wiadomość', slug: 'wiadomosc', color: '#06B6D4', icon: '📢' },
    { name: 'Zguba', slug: 'zguba', color: '#D946EF', icon: '🔍' },
    { name: 'Znaleziony', slug: 'znaleziony', color: '#10B981', icon: '✓' },
    { name: 'Mieszkańcy', slug: 'mieszkancy', color: '#F59E0B', icon: '👥' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  // Create Polish cities
  const cities = [
    {
      name: 'Białystok',
      voivodeship: 'Podlaskie',
      latitude: 53.1325,
      longitude: 23.1688,
    },
    {
      name: 'Bydgoszcz',
      voivodeship: 'Kujawsko-Pomorskie',
      latitude: 53.1235,
      longitude: 18.0084,
    },
    {
      name: 'Gdańsk',
      voivodeship: 'Pomorskie',
      latitude: 54.352,
      longitude: 18.6466,
    },
    {
      name: 'Gorzów Wielkopolski',
      voivodeship: 'Lubuskie',
      latitude: 52.7368,
      longitude: 15.2288,
    },
    {
      name: 'Katowice',
      voivodeship: 'Śląskie',
      latitude: 50.2649,
      longitude: 19.0238,
    },
    {
      name: 'Kielce',
      voivodeship: 'Świętokrzyskie',
      latitude: 50.8661,
      longitude: 20.6286,
    },
    {
      name: 'Kraków',
      voivodeship: 'Małopolskie',
      latitude: 50.0647,
      longitude: 19.945,
    },
    {
      name: 'Lublin',
      voivodeship: 'Lubelskie',
      latitude: 51.2465,
      longitude: 22.5684,
    },
    {
      name: 'Łódź',
      voivodeship: 'Łódzkie',
      latitude: 51.7592,
      longitude: 19.456,
    },
    {
      name: 'Olsztyn',
      voivodeship: 'Warmińsko-Mazurskie',
      latitude: 53.7784,
      longitude: 20.4801,
    },
    {
      name: 'Opole',
      voivodeship: 'Opolskie',
      latitude: 50.6751,
      longitude: 17.9213,
    },
    {
      name: 'Poznań',
      voivodeship: 'Wielkopolskie',
      latitude: 52.4064,
      longitude: 16.9252,
    },
    {
      name: 'Rzeszów',
      voivodeship: 'Podkarpackie',
      latitude: 50.0412,
      longitude: 21.9991,
    },
    {
      name: 'Szczecin',
      voivodeship: 'Zachodniopomorskie',
      latitude: 53.4285,
      longitude: 14.5528,
    },
    {
      name: 'Toruń',
      voivodeship: 'Kujawsko-Pomorskie',
      latitude: 53.0138,
      longitude: 18.5984,
    },
    {
      name: 'Warszawa',
      voivodeship: 'Mazowieckie',
      latitude: 52.2297,
      longitude: 21.0122,
    },
    {
      name: 'Wrocław',
      voivodeship: 'Dolnośląskie',
      latitude: 51.1079,
      longitude: 17.0385,
    },
    {
      name: 'Zielona Góra',
      voivodeship: 'Lubuskie',
      latitude: 51.9356,
      longitude: 15.5062,
    },
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { name: city.name },
      update: city,
      create: city,
    });
  }

  console.log('Seeding completed.');


const testUser = await prisma.user.findFirst();
  
  if (!testUser) {
    console.log('⚠️ Błąd: Nie znaleziono użytkownika!');
  } else {
    console.log(`✅ Znaleziono użytkownika: ${testUser.id}. Przystępuję do tworzenia postów...`);
    
    // 2. Pobieramy potrzebne kategorie
    const wypadekCat = await prisma.category.findUnique({ where: { slug: 'wypadek' } });
    const usterkaCat = await prisma.category.findUnique({ where: { slug: 'usterka' } });
    const zgubaCat = await prisma.category.findUnique({ where: { slug: 'zguba' } });

    // 3. Pobieramy miasta
    const bydgoszcz = await prisma.city.findUnique({ where: { name: 'Bydgoszcz' } });
    const warszawa = await prisma.city.findUnique({ where: { name: 'Warszawa' } });

    console.log(`Bydgoszcz ID: ${bydgoszcz?.id}, Warszawa ID: ${warszawa?.id}`);

    // 4. Tworzymy przykładowe posty
    if (bydgoszcz && wypadekCat) {
      await prisma.post.create({
        data: {
          title: 'Stłuczka na Rondzie Jagiellonów',
          description: 'Zderzenie dwóch osobówek, zablokowany jeden pas. Uważajcie na korki!',
          latitude: 53.1215,
          longitude: 18.0134,
          authorId: testUser.id,
          cityId: bydgoszcz.id,
          categoryId: wypadekCat.id,
          upvotes: 12,
        },
      });
      console.log('✅ Dodano post: Wypadek Bydgoszcz');
    }

    if (bydgoszcz && usterkaCat) {
      await prisma.post.create({
        data: {
          title: 'Awaria świateł na Focha',
          description: 'Sygnalizacja świetlna całkowicie padła, ruchem kieruje policja.',
          latitude: 53.1245,
          longitude: 17.9980,
          authorId: testUser.id,
          cityId: bydgoszcz.id,
          categoryId: usterkaCat.id,
          upvotes: 5,
        },
      });
      console.log('✅ Dodano post: Usterka Bydgoszcz');
    }

    if (warszawa && zgubaCat) {
      await prisma.post.create({
        data: {
          title: 'Zaginął mały piesek (Mokotów)',
          description: 'Rudy kundelek, ma na sobie czerwoną obrożę. Uciekł w stronę parku.',
          latitude: 52.2052,
          longitude: 21.0133,
          authorId: testUser.id,
          cityId: warszawa.id,
          categoryId: zgubaCat.id,
          upvotes: 24,
        },
      });
      console.log('✅ Dodano post: Zguba Warszawa');
    }
  }

  // TEN NAPIS MUSI BYĆ NA SAMYM KOŃCU!
  console.log('🚀 Seeding całkowicie zakończony.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


