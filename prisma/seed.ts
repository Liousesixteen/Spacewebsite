import { PrismaClient, RocketStatus, LaunchSiteStatus, LaunchStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 创建示例火箭
  const falcon9 = await prisma.rocket.upsert({
    where: { id: 'falcon-9' },
    update: {},
    create: {
      id: 'falcon-9',
      name: 'Falcon 9',
      manufacturer: 'SpaceX',
      country: 'USA',
      height: 70,
      diameter: 3.7,
      mass: 549,
      payloadToLEO: 22.8,
      payloadToGTO: 8.3,
      stages: 2,
      firstFlight: new Date('2010-06-04'),
      status: RocketStatus.ACTIVE,
      successRate: 98.5,
      description: 'Falcon 9 is a reusable, two-stage rocket designed and manufactured by SpaceX.',
      images: ['https://example.com/falcon9.jpg'],
    },
  });

  const longMarch5 = await prisma.rocket.upsert({
    where: { id: 'long-march-5' },
    update: {},
    create: {
      id: 'long-march-5',
      name: '长征五号',
      manufacturer: 'CASC',
      country: 'China',
      height: 56.97,
      diameter: 5,
      mass: 867,
      payloadToLEO: 25,
      payloadToGTO: 14,
      stages: 2,
      firstFlight: new Date('2016-11-03'),
      status: RocketStatus.ACTIVE,
      successRate: 85.7,
      description: '长征五号是中国研制的新一代大型运载火箭。',
      images: ['https://example.com/cz5.jpg'],
    },
  });

  // 创建示例发射场
  const ksc = await prisma.launchSite.upsert({
    where: { id: 'ksc-lc39a' },
    update: {},
    create: {
      id: 'ksc-lc39a',
      name: 'Kennedy Space Center LC-39A',
      country: 'USA',
      region: 'Florida',
      latitude: 28.6083,
      longitude: -80.6041,
      operator: 'SpaceX',
      status: LaunchSiteStatus.ACTIVE,
      pads: [{ name: 'LC-39A', status: 'active' }],
      description: 'Launch Complex 39A at Kennedy Space Center.',
    },
  });

  const wenchang = await prisma.launchSite.upsert({
    where: { id: 'wenchang' },
    update: {},
    create: {
      id: 'wenchang',
      name: '文昌航天发射场',
      country: 'China',
      region: 'Hainan',
      latitude: 19.6145,
      longitude: 110.9510,
      operator: 'CNSA',
      status: LaunchSiteStatus.ACTIVE,
      pads: [{ name: 'LC-1', status: 'active' }, { name: 'LC-2', status: 'active' }],
      description: '中国文昌航天发射场，位于海南省。',
    },
  });

  // 创建示例发射
  await prisma.launch.upsert({
    where: { id: 'starlink-mission-1' },
    update: {},
    create: {
      id: 'starlink-mission-1',
      name: 'Starlink Group 6-1',
      date: new Date('2024-01-15'),
      status: LaunchStatus.SUCCESS,
      missionDescription: 'SpaceX Starlink satellite deployment mission.',
      payloads: [{ name: 'Starlink satellites', count: 23, type: 'satellite' }],
      videoUrl: 'https://youtube.com/watch?v=example',
      images: [],
      rocketId: falcon9.id,
      launchSiteId: ksc.id,
    },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
