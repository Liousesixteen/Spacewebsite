import {
  PrismaClient,
  Prisma,
  RocketStatus,
  LaunchSiteStatus,
  LaunchStatus,
  AstronautStatus,
  SpacecraftType,
  SpacecraftStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

// Helper: convert days to minutes for totalTimeInSpace
const days = (d: number) => Math.round(d * 24 * 60);

// =============================================================================
// ROCKETS
// =============================================================================
const rockets = [
  // ---- SpaceX ----
  {
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
    description:
      'Falcon 9 is a partially reusable, two-stage-to-orbit medium-lift launch vehicle designed and manufactured by SpaceX. It has flown more than 300 times with industry-leading reliability and reusability.',
    images: ['https://example.com/rockets/falcon9.jpg'],
  },
  {
    id: 'falcon-heavy',
    name: 'Falcon Heavy',
    manufacturer: 'SpaceX',
    country: 'USA',
    height: 70,
    diameter: 12.2,
    mass: 1420,
    payloadToLEO: 63.8,
    payloadToGTO: 26.7,
    stages: 2,
    firstFlight: new Date('2018-02-06'),
    status: RocketStatus.ACTIVE,
    successRate: 100,
    description:
      'Falcon Heavy is a partially reusable super heavy-lift launch vehicle. It is essentially three Falcon 9 cores strapped together, making it one of the most powerful operational rockets in the world.',
    images: ['https://example.com/rockets/falcon-heavy.jpg'],
  },
  {
    id: 'starship',
    name: 'Starship',
    manufacturer: 'SpaceX',
    country: 'USA',
    height: 121,
    diameter: 9,
    mass: 5000,
    payloadToLEO: 150,
    payloadToGTO: 21,
    stages: 2,
    firstFlight: new Date('2023-04-20'),
    status: RocketStatus.IN_DEVELOPMENT,
    successRate: 50,
    description:
      'Starship is a fully reusable super heavy-lift launch vehicle being developed by SpaceX. Combined with the Super Heavy booster, it is intended to enable crewed missions to the Moon and Mars.',
    images: ['https://example.com/rockets/starship.jpg'],
  },
  // ---- China ----
  {
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
    description:
      '长征五号是中国研制的新一代大型运载火箭，是目前中国运载能力最大的火箭，承担了天问一号、嫦娥五号等重大任务。',
    images: ['https://example.com/rockets/cz5.jpg'],
  },
  {
    id: 'long-march-7',
    name: '长征七号',
    manufacturer: 'CASC',
    country: 'China',
    height: 53.1,
    diameter: 3.35,
    mass: 597,
    payloadToLEO: 14,
    payloadToGTO: 5.5,
    stages: 2,
    firstFlight: new Date('2016-06-25'),
    status: RocketStatus.ACTIVE,
    successRate: 90,
    description:
      '长征七号是中国新一代中型运载火箭，主要承担空间站货运飞船天舟系列的发射任务。',
    images: ['https://example.com/rockets/cz7.jpg'],
  },
  {
    id: 'long-march-9',
    name: '长征九号',
    manufacturer: 'CASC',
    country: 'China',
    height: 110,
    diameter: 10,
    mass: 4137,
    payloadToLEO: 150,
    payloadToGTO: 50,
    stages: 3,
    firstFlight: null,
    status: RocketStatus.IN_DEVELOPMENT,
    successRate: 0,
    description:
      '长征九号是中国正在研制的新一代重型运载火箭，预计用于载人登月、火星探测等深空任务。',
    images: ['https://example.com/rockets/cz9.jpg'],
  },
  {
    id: 'long-march-2f',
    name: '长征二号F',
    manufacturer: 'CASC',
    country: 'China',
    height: 58.34,
    diameter: 3.35,
    mass: 464,
    payloadToLEO: 8.4,
    payloadToGTO: 0,
    stages: 2,
    firstFlight: new Date('1999-11-19'),
    status: RocketStatus.ACTIVE,
    successRate: 100,
    description:
      '长征二号F（CZ-2F）是中国专门用于载人航天发射任务的运载火箭，承担了从神舟五号至今所有神舟飞船的发射任务。',
    images: ['https://example.com/rockets/cz2f.jpg'],
  },
  // ---- USA Other ----
  {
    id: 'sls',
    name: 'Space Launch System',
    manufacturer: 'NASA / Boeing',
    country: 'USA',
    height: 98,
    diameter: 8.4,
    mass: 2600,
    payloadToLEO: 95,
    payloadToGTO: 27,
    stages: 2,
    firstFlight: new Date('2022-11-16'),
    status: RocketStatus.ACTIVE,
    successRate: 100,
    description:
      'The Space Launch System (SLS) is NASA\'s super heavy-lift expendable launch vehicle, designed for the Artemis program to return humans to the Moon and beyond.',
    images: ['https://example.com/rockets/sls.jpg'],
  },
  {
    id: 'atlas-v',
    name: 'Atlas V',
    manufacturer: 'United Launch Alliance',
    country: 'USA',
    height: 58.3,
    diameter: 3.81,
    mass: 546,
    payloadToLEO: 18.85,
    payloadToGTO: 8.9,
    stages: 2,
    firstFlight: new Date('2002-08-21'),
    status: RocketStatus.ACTIVE,
    successRate: 99,
    description:
      'Atlas V is an expendable launch system in the Atlas rocket family operated by United Launch Alliance, with one of the highest reliability records in the industry.',
    images: ['https://example.com/rockets/atlas-v.jpg'],
  },
  {
    id: 'delta-iv-heavy',
    name: 'Delta IV Heavy',
    manufacturer: 'United Launch Alliance',
    country: 'USA',
    height: 72,
    diameter: 5,
    mass: 733,
    payloadToLEO: 28.79,
    payloadToGTO: 14.22,
    stages: 2,
    firstFlight: new Date('2004-12-21'),
    status: RocketStatus.RETIRED,
    successRate: 95,
    description:
      'Delta IV Heavy was an expendable heavy-lift launch vehicle and was the second highest capacity launcher in operation until its retirement in 2024.',
    images: ['https://example.com/rockets/delta-iv-heavy.jpg'],
  },
  {
    id: 'vulcan-centaur',
    name: 'Vulcan Centaur',
    manufacturer: 'United Launch Alliance',
    country: 'USA',
    height: 61.6,
    diameter: 5.4,
    mass: 546,
    payloadToLEO: 27.2,
    payloadToGTO: 14.4,
    stages: 2,
    firstFlight: new Date('2024-01-08'),
    status: RocketStatus.ACTIVE,
    successRate: 100,
    description:
      'Vulcan Centaur is a heavy-lift launch vehicle developed by United Launch Alliance, intended to replace both the Atlas V and Delta IV.',
    images: ['https://example.com/rockets/vulcan.jpg'],
  },
  {
    id: 'electron',
    name: 'Electron',
    manufacturer: 'Rocket Lab',
    country: 'USA',
    height: 18,
    diameter: 1.2,
    mass: 13,
    payloadToLEO: 0.3,
    payloadToGTO: 0,
    stages: 2,
    firstFlight: new Date('2017-05-25'),
    status: RocketStatus.ACTIVE,
    successRate: 92,
    description:
      'Electron is a small-lift, two-stage launch vehicle developed by Rocket Lab. It primarily serves the small satellite market with frequent launches from New Zealand and the United States.',
    images: ['https://example.com/rockets/electron.jpg'],
  },
  // ---- Russia ----
  {
    id: 'soyuz-2',
    name: 'Soyuz-2',
    manufacturer: 'Progress Rocket Space Centre',
    country: 'Russia',
    height: 46.3,
    diameter: 10.3,
    mass: 312,
    payloadToLEO: 8.2,
    payloadToGTO: 3.25,
    stages: 3,
    firstFlight: new Date('2004-11-08'),
    status: RocketStatus.ACTIVE,
    successRate: 95,
    description:
      'Soyuz-2 is a modernized version of the Soviet Soyuz rocket, used to launch Soyuz crewed spacecraft, Progress cargo vehicles, and various satellites.',
    images: ['https://example.com/rockets/soyuz-2.jpg'],
  },
  {
    id: 'proton-m',
    name: 'Proton-M',
    manufacturer: 'Khrunichev',
    country: 'Russia',
    height: 58.2,
    diameter: 7.4,
    mass: 705,
    payloadToLEO: 23,
    payloadToGTO: 6.92,
    stages: 3,
    firstFlight: new Date('2001-04-07'),
    status: RocketStatus.ACTIVE,
    successRate: 89,
    description:
      'Proton-M is a Russian heavy-lift launch vehicle derived from the Soviet-era Proton, primarily used for commercial satellite launches and Russian government missions.',
    images: ['https://example.com/rockets/proton-m.jpg'],
  },
  // ---- Europe ----
  {
    id: 'ariane-5',
    name: 'Ariane 5',
    manufacturer: 'ArianeGroup',
    country: 'Europe',
    height: 53,
    diameter: 5.4,
    mass: 777,
    payloadToLEO: 21,
    payloadToGTO: 10.5,
    stages: 2,
    firstFlight: new Date('1996-06-04'),
    status: RocketStatus.RETIRED,
    successRate: 95.7,
    description:
      'Ariane 5 was a European heavy-lift launch vehicle developed by ESA and operated by Arianespace. It famously launched the James Webb Space Telescope before being retired in 2023.',
    images: ['https://example.com/rockets/ariane-5.jpg'],
  },
  {
    id: 'ariane-6',
    name: 'Ariane 6',
    manufacturer: 'ArianeGroup',
    country: 'Europe',
    height: 63,
    diameter: 5.4,
    mass: 860,
    payloadToLEO: 21.6,
    payloadToGTO: 11.5,
    stages: 2,
    firstFlight: new Date('2024-07-09'),
    status: RocketStatus.ACTIVE,
    successRate: 100,
    description:
      'Ariane 6 is the successor to Ariane 5, designed to provide Europe with autonomous access to space at a reduced cost.',
    images: ['https://example.com/rockets/ariane-6.jpg'],
  },
  // ---- India ----
  {
    id: 'pslv',
    name: 'PSLV',
    manufacturer: 'ISRO',
    country: 'India',
    height: 44,
    diameter: 2.8,
    mass: 320,
    payloadToLEO: 3.8,
    payloadToGTO: 1.4,
    stages: 4,
    firstFlight: new Date('1993-09-20'),
    status: RocketStatus.ACTIVE,
    successRate: 94,
    description:
      'The Polar Satellite Launch Vehicle (PSLV) is an expendable launch system developed by ISRO. It is renowned for its reliability and rideshare missions, including the launch of Chandrayaan-1 and Mangalyaan.',
    images: ['https://example.com/rockets/pslv.jpg'],
  },
  {
    id: 'gslv',
    name: 'GSLV Mk III',
    manufacturer: 'ISRO',
    country: 'India',
    height: 43.5,
    diameter: 4,
    mass: 640,
    payloadToLEO: 10,
    payloadToGTO: 4,
    stages: 3,
    firstFlight: new Date('2014-12-18'),
    status: RocketStatus.ACTIVE,
    successRate: 100,
    description:
      'GSLV Mk III (LVM3) is the most powerful Indian launch vehicle, used for launching Chandrayaan-2, Chandrayaan-3, and the upcoming Gaganyaan crewed mission.',
    images: ['https://example.com/rockets/gslv.jpg'],
  },
  // ---- Japan ----
  {
    id: 'h2a',
    name: 'H-IIA',
    manufacturer: 'Mitsubishi Heavy Industries',
    country: 'Japan',
    height: 53,
    diameter: 4,
    mass: 445,
    payloadToLEO: 15,
    payloadToGTO: 6,
    stages: 2,
    firstFlight: new Date('2001-08-29'),
    status: RocketStatus.ACTIVE,
    successRate: 97.6,
    description:
      'H-IIA is a Japanese expendable launch system that has launched a wide range of payloads including the Hayabusa asteroid sample return missions and lunar probes.',
    images: ['https://example.com/rockets/h2a.jpg'],
  },
  {
    id: 'h3',
    name: 'H3',
    manufacturer: 'Mitsubishi Heavy Industries',
    country: 'Japan',
    height: 63,
    diameter: 5.2,
    mass: 574,
    payloadToLEO: 15.7,
    payloadToGTO: 7.9,
    stages: 2,
    firstFlight: new Date('2023-03-07'),
    status: RocketStatus.ACTIVE,
    successRate: 80,
    description:
      'H3 is the successor to H-IIA, developed by JAXA and Mitsubishi Heavy Industries to provide Japan with cost-effective access to space.',
    images: ['https://example.com/rockets/h3.jpg'],
  },
];
// =============================================================================
// LAUNCH SITES
// =============================================================================
const launchSites = [
  // ---- USA ----
  {
    id: 'ksc-lc39a',
    name: 'Kennedy Space Center LC-39A',
    country: 'USA',
    region: 'Florida',
    latitude: 28.6083,
    longitude: -80.6041,
    operator: 'NASA / SpaceX',
    status: LaunchSiteStatus.ACTIVE,
    pads: [{ name: 'LC-39A', status: 'active' }],
    description:
      'Launch Complex 39A at Kennedy Space Center, Florida. Historically used for Apollo and Space Shuttle missions, now leased to SpaceX for Falcon 9, Falcon Heavy, and crewed Dragon flights.',
  },
  {
    id: 'ccsfs',
    name: 'Cape Canaveral Space Force Station',
    country: 'USA',
    region: 'Florida',
    latitude: 28.4889,
    longitude: -80.5778,
    operator: 'United States Space Force',
    status: LaunchSiteStatus.ACTIVE,
    pads: [
      { name: 'SLC-40', status: 'active' },
      { name: 'SLC-41', status: 'active' },
      { name: 'SLC-37', status: 'inactive' },
    ],
    description:
      'Cape Canaveral Space Force Station is the primary U.S. spaceport on the Atlantic coast, hosting launches of Falcon 9, Atlas V, Vulcan Centaur, and many others.',
  },
  {
    id: 'vandenberg',
    name: 'Vandenberg Space Force Base',
    country: 'USA',
    region: 'California',
    latitude: 34.7420,
    longitude: -120.5724,
    operator: 'United States Space Force',
    status: LaunchSiteStatus.ACTIVE,
    pads: [
      { name: 'SLC-4E', status: 'active' },
      { name: 'SLC-6', status: 'active' },
    ],
    description:
      'Vandenberg Space Force Base on the California coast is the primary U.S. site for polar and sun-synchronous orbit launches.',
  },
  {
    id: 'starbase',
    name: 'Starbase (Boca Chica)',
    country: 'USA',
    region: 'Texas',
    latitude: 25.9972,
    longitude: -97.1556,
    operator: 'SpaceX',
    status: LaunchSiteStatus.ACTIVE,
    pads: [{ name: 'OLP-A', status: 'active' }],
    description:
      'Starbase is SpaceX\'s private spaceport in Boca Chica, Texas, dedicated to development and orbital flights of the Starship vehicle.',
  },
  // ---- China ----
  {
    id: 'wenchang',
    name: '文昌航天发射场',
    country: 'China',
    region: 'Hainan',
    latitude: 19.6145,
    longitude: 110.951,
    operator: 'CNSA',
    status: LaunchSiteStatus.ACTIVE,
    pads: [
      { name: 'LC-1', status: 'active' },
      { name: 'LC-2', status: 'active' },
      { name: 'LC-201', status: 'active' },
    ],
    description:
      '文昌航天发射场位于海南省文昌市，是中国纬度最低的航天发射场，主要承担长征五号、长征七号系列大型火箭的发射任务。',
  },
  {
    id: 'jiuquan',
    name: '酒泉卫星发射中心',
    country: 'China',
    region: 'Inner Mongolia',
    latitude: 40.9583,
    longitude: 100.2917,
    operator: 'CNSA',
    status: LaunchSiteStatus.ACTIVE,
    pads: [
      { name: 'SLS-1', status: 'active' },
      { name: 'SLS-2', status: 'active' },
    ],
    description:
      '酒泉卫星发射中心是中国创建最早、规模最大的综合性航天发射中心，是中国唯一执行载人航天发射任务的发射场。',
  },
  {
    id: 'taiyuan',
    name: '太原卫星发射中心',
    country: 'China',
    region: 'Shanxi',
    latitude: 38.8489,
    longitude: 111.6086,
    operator: 'CNSA',
    status: LaunchSiteStatus.ACTIVE,
    pads: [
      { name: 'LC-7', status: 'active' },
      { name: 'LC-9', status: 'active' },
    ],
    description:
      '太原卫星发射中心位于山西省，主要承担太阳同步轨道、极地轨道和返回式卫星的发射任务。',
  },
  {
    id: 'xichang',
    name: '西昌卫星发射中心',
    country: 'China',
    region: 'Sichuan',
    latitude: 28.2456,
    longitude: 102.0269,
    operator: 'CNSA',
    status: LaunchSiteStatus.ACTIVE,
    pads: [
      { name: 'LC-2', status: 'active' },
      { name: 'LC-3', status: 'active' },
    ],
    description:
      '西昌卫星发射中心位于四川省西昌市，主要承担地球同步轨道卫星发射任务，曾发射嫦娥一号、北斗导航卫星等。',
  },
  // ---- Russia / Kazakhstan ----
  {
    id: 'baikonur',
    name: 'Baikonur Cosmodrome',
    country: 'Kazakhstan',
    region: 'Kyzylorda',
    latitude: 45.965,
    longitude: 63.305,
    operator: 'Roscosmos',
    status: LaunchSiteStatus.ACTIVE,
    pads: [
      { name: 'Site 1/5 (Gagarin\'s Start)', status: 'inactive' },
      { name: 'Site 31/6', status: 'active' },
      { name: 'Site 81/24', status: 'active' },
    ],
    description:
      'Baikonur Cosmodrome is the world\'s first and largest operational space launch facility, leased by Russia from Kazakhstan. It is the historic site of Sputnik 1 and Yuri Gagarin\'s flight.',
  },
  {
    id: 'plesetsk',
    name: 'Plesetsk Cosmodrome',
    country: 'Russia',
    region: 'Arkhangelsk Oblast',
    latitude: 62.9272,
    longitude: 40.5742,
    operator: 'Russian Aerospace Forces',
    status: LaunchSiteStatus.ACTIVE,
    pads: [
      { name: 'Site 43', status: 'active' },
      { name: 'Site 133', status: 'active' },
    ],
    description:
      'Plesetsk Cosmodrome is a Russian spaceport primarily used for military and scientific missions, especially for polar and Molniya orbits.',
  },
  // ---- Europe ----
  {
    id: 'kourou',
    name: 'Guiana Space Centre',
    country: 'France',
    region: 'French Guiana',
    latitude: 5.236,
    longitude: -52.7754,
    operator: 'CNES / ESA / Arianespace',
    status: LaunchSiteStatus.ACTIVE,
    pads: [
      { name: 'ELA-3 (Ariane)', status: 'inactive' },
      { name: 'ELA-4 (Ariane 6)', status: 'active' },
      { name: 'ELS (Soyuz)', status: 'inactive' },
    ],
    description:
      'The Guiana Space Centre in Kourou, French Guiana, is the European spaceport. Its near-equatorial location makes it ideal for geostationary launches.',
  },
  // ---- Japan ----
  {
    id: 'tanegashima',
    name: 'Tanegashima Space Center',
    country: 'Japan',
    region: 'Kagoshima',
    latitude: 30.3739,
    longitude: 130.9686,
    operator: 'JAXA',
    status: LaunchSiteStatus.ACTIVE,
    pads: [
      { name: 'Yoshinobu LP1', status: 'active' },
      { name: 'Yoshinobu LP2', status: 'active' },
    ],
    description:
      'Tanegashima Space Center is the largest rocket launch complex in Japan, located on Tanegashima Island. It hosts H-IIA and H3 launches.',
  },
  // ---- India ----
  {
    id: 'sriharikota',
    name: 'Satish Dhawan Space Centre',
    country: 'India',
    region: 'Andhra Pradesh',
    latitude: 13.7333,
    longitude: 80.235,
    operator: 'ISRO',
    status: LaunchSiteStatus.ACTIVE,
    pads: [
      { name: 'First Launch Pad', status: 'active' },
      { name: 'Second Launch Pad', status: 'active' },
    ],
    description:
      'Satish Dhawan Space Centre on Sriharikota island is India\'s primary spaceport, operated by ISRO for PSLV, GSLV, and the Chandrayaan lunar program.',
  },
];
// =============================================================================
// ASTRONAUTS
// =============================================================================
const astronauts = [
  // ---- USA ----
  {
    id: 'neil-armstrong',
    name: 'Neil Armstrong',
    nationality: 'USA',
    agency: 'NASA',
    birthDate: new Date('1930-08-05'),
    status: AstronautStatus.DECEASED,
    spaceFlights: 2,
    totalTimeInSpace: days(8.59),
    bio: 'Neil Armstrong was an American astronaut and aeronautical engineer, best known as the first person to walk on the Moon during the Apollo 11 mission on July 20, 1969.',
    photo: 'https://example.com/astronauts/armstrong.jpg',
    socialLinks: Prisma.JsonNull,
  },
  {
    id: 'buzz-aldrin',
    name: 'Buzz Aldrin',
    nationality: 'USA',
    agency: 'NASA',
    birthDate: new Date('1930-01-20'),
    status: AstronautStatus.RETIRED,
    spaceFlights: 2,
    totalTimeInSpace: days(12.07),
    bio: 'Edwin "Buzz" Aldrin is an American former astronaut, engineer and fighter pilot. He was the lunar module pilot on Apollo 11, becoming the second person to walk on the Moon.',
    photo: 'https://example.com/astronauts/aldrin.jpg',
    socialLinks: { twitter: 'https://twitter.com/TheRealBuzz' },
  },
  {
    id: 'sally-ride',
    name: 'Sally Ride',
    nationality: 'USA',
    agency: 'NASA',
    birthDate: new Date('1951-05-26'),
    status: AstronautStatus.DECEASED,
    spaceFlights: 2,
    totalTimeInSpace: days(14.31),
    bio: 'Sally Ride was an American astronaut and physicist. In 1983 she became the first American woman in space aboard Space Shuttle Challenger STS-7.',
    photo: 'https://example.com/astronauts/ride.jpg',
    socialLinks: Prisma.JsonNull,
  },
  {
    id: 'sunita-williams',
    name: 'Sunita Williams',
    nationality: 'USA',
    agency: 'NASA',
    birthDate: new Date('1965-09-19'),
    status: AstronautStatus.ACTIVE,
    spaceFlights: 3,
    totalTimeInSpace: days(322),
    bio: 'Sunita "Suni" Williams is an American astronaut and U.S. Navy officer. She has held records for total spacewalks by a woman and was a Boeing Starliner test pilot.',
    photo: 'https://example.com/astronauts/williams.jpg',
    socialLinks: { twitter: 'https://twitter.com/Astro_Suni' },
  },
  {
    id: 'christina-koch',
    name: 'Christina Koch',
    nationality: 'USA',
    agency: 'NASA',
    birthDate: new Date('1979-01-29'),
    status: AstronautStatus.ACTIVE,
    spaceFlights: 1,
    totalTimeInSpace: days(328),
    bio: 'Christina Koch is an American engineer and NASA astronaut. She set the record for the longest single spaceflight by a woman (328 days) and is assigned to Artemis II.',
    photo: 'https://example.com/astronauts/koch.jpg',
    socialLinks: { twitter: 'https://twitter.com/Astro_Christina' },
  },
  {
    id: 'scott-kelly',
    name: 'Scott Kelly',
    nationality: 'USA',
    agency: 'NASA',
    birthDate: new Date('1964-02-21'),
    status: AstronautStatus.RETIRED,
    spaceFlights: 4,
    totalTimeInSpace: days(520),
    bio: 'Scott Kelly is a retired American astronaut and U.S. Navy captain. He commanded the ISS during Expeditions 26, 45, and 46, including a one-year mission.',
    photo: 'https://example.com/astronauts/kelly.jpg',
    socialLinks: { twitter: 'https://twitter.com/StationCDRKelly' },
  },
  // ---- China ----
  {
    id: 'yang-liwei',
    name: '杨利伟',
    nationality: 'China',
    agency: 'CNSA',
    birthDate: new Date('1965-06-21'),
    status: AstronautStatus.ACTIVE,
    spaceFlights: 1,
    totalTimeInSpace: days(0.9),
    bio: '杨利伟，中国人民解放军特级航天员，中国进入太空第一人。2003年10月15日，他乘坐神舟五号飞船成功完成首次载人航天飞行。',
    photo: 'https://example.com/astronauts/yang-liwei.jpg',
    socialLinks: Prisma.JsonNull,
  },
  {
    id: 'zhai-zhigang',
    name: '翟志刚',
    nationality: 'China',
    agency: 'CNSA',
    birthDate: new Date('1966-10-10'),
    status: AstronautStatus.ACTIVE,
    spaceFlights: 3,
    totalTimeInSpace: days(192),
    bio: '翟志刚，中国人民解放军特级航天员，中国太空行走第一人。先后执行神舟七号、神舟十三号、神舟十七号任务。',
    photo: 'https://example.com/astronauts/zhai-zhigang.jpg',
    socialLinks: Prisma.JsonNull,
  },
  {
    id: 'liu-yang',
    name: '刘洋',
    nationality: 'China',
    agency: 'CNSA',
    birthDate: new Date('1978-10-06'),
    status: AstronautStatus.ACTIVE,
    spaceFlights: 2,
    totalTimeInSpace: days(196),
    bio: '刘洋，中国首位进入太空的女航天员。2012年执行神舟九号任务，2022年作为神舟十四号乘组进入中国空间站。',
    photo: 'https://example.com/astronauts/liu-yang.jpg',
    socialLinks: Prisma.JsonNull,
  },
  {
    id: 'wang-yaping',
    name: '王亚平',
    nationality: 'China',
    agency: 'CNSA',
    birthDate: new Date('1980-01-27'),
    status: AstronautStatus.ACTIVE,
    spaceFlights: 2,
    totalTimeInSpace: days(199),
    bio: '王亚平，中国首位进行太空授课的女航天员，也是中国首位实施出舱活动的女航天员。先后执行神舟十号、神舟十三号任务。',
    photo: 'https://example.com/astronauts/wang-yaping.jpg',
    socialLinks: Prisma.JsonNull,
  },
  {
    id: 'jing-haipeng',
    name: '景海鹏',
    nationality: 'China',
    agency: 'CNSA',
    birthDate: new Date('1966-10-24'),
    status: AstronautStatus.ACTIVE,
    spaceFlights: 4,
    totalTimeInSpace: days(220),
    bio: '景海鹏，中国人民解放军特级航天员，中国唯一四度飞天的航天员。先后执行神舟七号、神舟九号、神舟十一号、神舟十六号任务。',
    photo: 'https://example.com/astronauts/jing-haipeng.jpg',
    socialLinks: Prisma.JsonNull,
  },
  // ---- Russia ----
  {
    id: 'yuri-gagarin',
    name: 'Yuri Gagarin',
    nationality: 'Russia',
    agency: 'Soviet Space Program',
    birthDate: new Date('1934-03-09'),
    status: AstronautStatus.DECEASED,
    spaceFlights: 1,
    totalTimeInSpace: days(0.075),
    bio: 'Yuri Gagarin was a Soviet pilot and cosmonaut who became the first human to journey into outer space, completing one orbit of Earth aboard Vostok 1 on April 12, 1961.',
    photo: 'https://example.com/astronauts/gagarin.jpg',
    socialLinks: Prisma.JsonNull,
  },
  {
    id: 'valentina-tereshkova',
    name: 'Valentina Tereshkova',
    nationality: 'Russia',
    agency: 'Soviet Space Program',
    birthDate: new Date('1937-03-06'),
    status: AstronautStatus.RETIRED,
    spaceFlights: 1,
    totalTimeInSpace: days(2.95),
    bio: 'Valentina Tereshkova is a Russian engineer and former cosmonaut who, on Vostok 6 in 1963, became the first woman in space.',
    photo: 'https://example.com/astronauts/tereshkova.jpg',
    socialLinks: Prisma.JsonNull,
  },
  {
    id: 'gennady-padalka',
    name: 'Gennady Padalka',
    nationality: 'Russia',
    agency: 'Roscosmos',
    birthDate: new Date('1958-06-21'),
    status: AstronautStatus.RETIRED,
    spaceFlights: 5,
    totalTimeInSpace: days(878),
    bio: 'Gennady Padalka is a retired Russian cosmonaut who holds the all-time record for the most cumulative time spent in space at 878 days.',
    photo: 'https://example.com/astronauts/padalka.jpg',
    socialLinks: Prisma.JsonNull,
  },
  {
    id: 'anatoly-solovyev',
    name: 'Anatoly Solovyev',
    nationality: 'Russia',
    agency: 'Roscosmos',
    birthDate: new Date('1948-01-16'),
    status: AstronautStatus.RETIRED,
    spaceFlights: 5,
    totalTimeInSpace: days(651),
    bio: 'Anatoly Solovyev is a retired Russian cosmonaut who holds the record for the most spacewalks (16) and most accumulated EVA time (over 82 hours).',
    photo: 'https://example.com/astronauts/solovyev.jpg',
    socialLinks: Prisma.JsonNull,
  },
  // ---- Europe ----
  {
    id: 'tim-peake',
    name: 'Tim Peake',
    nationality: 'United Kingdom',
    agency: 'ESA',
    birthDate: new Date('1972-04-07'),
    status: AstronautStatus.RETIRED,
    spaceFlights: 1,
    totalTimeInSpace: days(186),
    bio: 'Tim Peake is a British former Army Air Corps officer and ESA astronaut. He flew to the ISS on the Principia mission in 2015-2016.',
    photo: 'https://example.com/astronauts/peake.jpg',
    socialLinks: { twitter: 'https://twitter.com/astro_timpeake' },
  },
  {
    id: 'samantha-cristoforetti',
    name: 'Samantha Cristoforetti',
    nationality: 'Italy',
    agency: 'ESA',
    birthDate: new Date('1977-04-26'),
    status: AstronautStatus.ACTIVE,
    spaceFlights: 2,
    totalTimeInSpace: days(369),
    bio: 'Samantha Cristoforetti is an Italian ESA astronaut and former Italian Air Force pilot. She holds the record for longest single spaceflight by a European.',
    photo: 'https://example.com/astronauts/cristoforetti.jpg',
    socialLinks: { twitter: 'https://twitter.com/AstroSamantha' },
  },
  // ---- Japan ----
  {
    id: 'soichi-noguchi',
    name: 'Soichi Noguchi',
    nationality: 'Japan',
    agency: 'JAXA',
    birthDate: new Date('1965-04-15'),
    status: AstronautStatus.RETIRED,
    spaceFlights: 3,
    totalTimeInSpace: days(344),
    bio: 'Soichi Noguchi is a Japanese aeronautical engineer and former JAXA astronaut. He has flown on the Space Shuttle, Soyuz, and SpaceX Crew Dragon.',
    photo: 'https://example.com/astronauts/noguchi.jpg',
    socialLinks: { twitter: 'https://twitter.com/Astro_Soichi' },
  },
];
// =============================================================================
// SPACECRAFT
// =============================================================================
const spacecraft = [
  // ---- Space Stations ----
  {
    id: 'iss',
    name: 'International Space Station',
    type: SpacecraftType.SPACE_STATION,
    operator: 'NASA / Roscosmos / ESA / JAXA / CSA',
    launchDate: new Date('1998-11-20'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'LEO',
    orbitAltitude: 408,
    orbitInclination: 51.6,
    orbitPeriod: 92.68,
    mass: 419725,
    dimensions: '109 x 73 x 20 m',
    mission:
      'Continuously crewed orbital laboratory for scientific research in microgravity, international cooperation, and preparation for deep-space exploration.',
    description:
      'The International Space Station is a modular space station in low Earth orbit, the largest artificial object in space. It has been continuously occupied since November 2000.',
    images: ['https://example.com/spacecraft/iss.jpg'],
  },
  {
    id: 'tiangong',
    name: '天宫空间站',
    type: SpacecraftType.SPACE_STATION,
    operator: 'CNSA',
    launchDate: new Date('2021-04-29'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'LEO',
    orbitAltitude: 389,
    orbitInclination: 41.5,
    orbitPeriod: 92,
    mass: 100000,
    dimensions: '约 55 x 39 m (T字构型)',
    mission:
      '中国自主研制的近地轨道载人空间站，开展空间科学实验和技术验证，支持长期载人驻留。',
    description:
      '天宫空间站是中国设计、建造、运营的近地轨道空间站，由天和核心舱、问天实验舱、梦天实验舱组成T字基本构型。',
    images: ['https://example.com/spacecraft/tiangong.jpg'],
  },
  {
    id: 'mir',
    name: 'Mir',
    type: SpacecraftType.SPACE_STATION,
    operator: 'Soviet / Russian Space Program',
    launchDate: new Date('1986-02-19'),
    status: SpacecraftStatus.RETIRED,
    orbitType: 'LEO',
    orbitAltitude: 354,
    orbitInclination: 51.6,
    orbitPeriod: 91.9,
    mass: 129700,
    dimensions: '19 x 31 x 27.5 m',
    mission:
      'First modular space station, served as microgravity research laboratory from 1986-2001 before deorbiting.',
    description:
      'Mir was a Soviet and later Russian space station that operated in low Earth orbit from 1986 to 2001. It was the first modular space station ever assembled.',
    images: ['https://example.com/spacecraft/mir.jpg'],
  },
  // ---- Probes ----
  {
    id: 'voyager-1',
    name: 'Voyager 1',
    type: SpacecraftType.PROBE,
    operator: 'NASA / JPL',
    launchDate: new Date('1977-09-05'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'Interstellar',
    orbitAltitude: null,
    orbitInclination: null,
    orbitPeriod: null,
    mass: 825,
    dimensions: '3.7 m antenna dish',
    mission:
      'Flyby studies of Jupiter and Saturn, then continuing into interstellar space; the most distant human-made object.',
    description:
      'Voyager 1 is a space probe launched by NASA in 1977. It has the distinction of being the first spacecraft to enter interstellar space (2012).',
    images: ['https://example.com/spacecraft/voyager-1.jpg'],
  },
  {
    id: 'voyager-2',
    name: 'Voyager 2',
    type: SpacecraftType.PROBE,
    operator: 'NASA / JPL',
    launchDate: new Date('1977-08-20'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'Interstellar',
    orbitAltitude: null,
    orbitInclination: null,
    orbitPeriod: null,
    mass: 825,
    dimensions: '3.7 m antenna dish',
    mission:
      'Grand Tour of the outer planets including Jupiter, Saturn, Uranus, and Neptune, then interstellar space.',
    description:
      'Voyager 2 is the only spacecraft to have visited all four giant planets. It crossed into interstellar space in 2018.',
    images: ['https://example.com/spacecraft/voyager-2.jpg'],
  },
  {
    id: 'parker-solar-probe',
    name: 'Parker Solar Probe',
    type: SpacecraftType.PROBE,
    operator: 'NASA',
    launchDate: new Date('2018-08-12'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'Heliocentric',
    orbitAltitude: 6900000,
    orbitInclination: 3.4,
    orbitPeriod: 88,
    mass: 685,
    dimensions: '3 x 2.3 x 1 m',
    mission:
      'Make the closest-ever flybys of the Sun to study the solar corona, solar wind, and coronal mass ejections.',
    description:
      'Parker Solar Probe is a NASA space probe that has made the closest approach to the Sun by any human-made object, studying the solar corona.',
    images: ['https://example.com/spacecraft/parker.jpg'],
  },
  {
    id: 'jwst',
    name: 'James Webb Space Telescope',
    type: SpacecraftType.PROBE,
    operator: 'NASA / ESA / CSA',
    launchDate: new Date('2021-12-25'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'Sun-Earth L2 Halo',
    orbitAltitude: 1500000,
    orbitInclination: 0,
    orbitPeriod: 525960,
    mass: 6500,
    dimensions: '20.197 x 14.162 m sunshield',
    mission:
      'Premier space-based infrared observatory studying the early universe, exoplanet atmospheres, and galaxy formation.',
    description:
      'The James Webb Space Telescope is the largest, most powerful space telescope ever built, operating at the Sun-Earth L2 Lagrange point.',
    images: ['https://example.com/spacecraft/jwst.jpg'],
  },
  {
    id: 'change-5',
    name: '嫦娥五号',
    type: SpacecraftType.PROBE,
    operator: 'CNSA',
    launchDate: new Date('2020-11-23'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'Lunar / Earth-Moon L1',
    orbitAltitude: null,
    orbitInclination: null,
    orbitPeriod: null,
    mass: 8200,
    dimensions: '由轨道器、返回器、着陆器、上升器组成',
    mission:
      '中国首次月面采样返回任务，成功带回1731克月壤样品。',
    description:
      '嫦娥五号是中国探月工程三期的关键任务，是中国首次月球采样返回任务，也是人类时隔44年再次从月球带回样品。',
    images: ['https://example.com/spacecraft/change-5.jpg'],
  },
  {
    id: 'tianwen-1',
    name: '天问一号',
    type: SpacecraftType.PROBE,
    operator: 'CNSA',
    launchDate: new Date('2020-07-23'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'Mars Orbit',
    orbitAltitude: null,
    orbitInclination: null,
    orbitPeriod: null,
    mass: 5000,
    dimensions: '环绕器、着陆器、祝融号火星车',
    mission:
      '中国首次火星探测任务，一次实现"绕、着、巡"三大目标。',
    description:
      '天问一号是中国首颗自主火星探测器，2021年5月15日成功着陆火星，部署祝融号火星车，是中国深空探测的重要里程碑。',
    images: ['https://example.com/spacecraft/tianwen-1.jpg'],
  },
  {
    id: 'new-horizons',
    name: 'New Horizons',
    type: SpacecraftType.PROBE,
    operator: 'NASA',
    launchDate: new Date('2006-01-19'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'Heliocentric / Kuiper Belt',
    orbitAltitude: null,
    orbitInclination: null,
    orbitPeriod: null,
    mass: 478,
    dimensions: '2.2 x 2.7 x 0.7 m',
    mission:
      'First reconnaissance flyby of Pluto (2015) and the Kuiper Belt object Arrokoth (2019).',
    description:
      'New Horizons is an interplanetary space probe that performed flybys of Pluto and Arrokoth, returning the first close-up images of these distant worlds.',
    images: ['https://example.com/spacecraft/new-horizons.jpg'],
  },
  // ---- Crewed ----
  {
    id: 'crew-dragon',
    name: 'Crew Dragon',
    type: SpacecraftType.CREWED_SPACECRAFT,
    operator: 'SpaceX',
    launchDate: new Date('2020-05-30'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'LEO',
    orbitAltitude: 408,
    orbitInclination: 51.6,
    orbitPeriod: 92.68,
    mass: 12519,
    dimensions: '8.1 x 4 m',
    mission:
      'Reusable crewed spacecraft transporting NASA and commercial astronauts to the ISS and other destinations.',
    description:
      'Crew Dragon (Dragon 2) is a reusable spacecraft developed by SpaceX, the first commercial spacecraft to carry astronauts to the ISS.',
    images: ['https://example.com/spacecraft/crew-dragon.jpg'],
  },
  {
    id: 'orion',
    name: 'Orion',
    type: SpacecraftType.CREWED_SPACECRAFT,
    operator: 'NASA / ESA',
    launchDate: new Date('2014-12-05'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'Trans-lunar / Lunar',
    orbitAltitude: null,
    orbitInclination: null,
    orbitPeriod: null,
    mass: 26520,
    dimensions: '5 x 3.3 m capsule',
    mission:
      'Deep-space crewed spacecraft for NASA\'s Artemis program, including crewed missions to the Moon.',
    description:
      'Orion is a partially reusable crewed spacecraft used in NASA\'s Artemis program, designed to send astronauts to the Moon and beyond.',
    images: ['https://example.com/spacecraft/orion.jpg'],
  },
  {
    id: 'shenzhou',
    name: '神舟飞船',
    type: SpacecraftType.CREWED_SPACECRAFT,
    operator: 'CNSA',
    launchDate: new Date('1999-11-20'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'LEO',
    orbitAltitude: 389,
    orbitInclination: 41.5,
    orbitPeriod: 92,
    mass: 7840,
    dimensions: '9.25 x 2.8 m',
    mission:
      '中国载人航天主力飞船，承担宇航员往返中国空间站的运输任务。',
    description:
      '神舟飞船是中国研制的载人飞船，由轨道舱、返回舱和推进舱构成。已完成包括神舟五号至神舟十八号在内的多次任务。',
    images: ['https://example.com/spacecraft/shenzhou.jpg'],
  },
  // ---- Cargo ----
  {
    id: 'progress',
    name: 'Progress',
    type: SpacecraftType.CARGO_SPACECRAFT,
    operator: 'Roscosmos',
    launchDate: new Date('1978-01-20'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'LEO',
    orbitAltitude: 408,
    orbitInclination: 51.6,
    orbitPeriod: 92.68,
    mass: 7150,
    dimensions: '7.23 x 2.72 m',
    mission:
      'Expendable cargo resupply spacecraft for Salyut, Mir, and ISS space stations.',
    description:
      'Progress is a Russian expendable cargo spacecraft that has served the Salyut, Mir, and International Space Station programs since 1978.',
    images: ['https://example.com/spacecraft/progress.jpg'],
  },
  {
    id: 'tianzhou',
    name: '天舟',
    type: SpacecraftType.CARGO_SPACECRAFT,
    operator: 'CNSA',
    launchDate: new Date('2017-04-20'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'LEO',
    orbitAltitude: 389,
    orbitInclination: 41.5,
    orbitPeriod: 92,
    mass: 13500,
    dimensions: '10.6 x 3.35 m',
    mission:
      '中国货运飞船，承担中国空间站的物资补给和推进剂在轨补加任务。',
    description:
      '天舟系列货运飞船是中国为空间站工程研制的货运飞船，最大上行载货能力达7吨，是空间站补给的主力。',
    images: ['https://example.com/spacecraft/tianzhou.jpg'],
  },
  // ---- Satellites ----
  {
    id: 'hubble',
    name: 'Hubble Space Telescope',
    type: SpacecraftType.SATELLITE,
    operator: 'NASA / ESA',
    launchDate: new Date('1990-04-24'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'LEO',
    orbitAltitude: 540,
    orbitInclination: 28.5,
    orbitPeriod: 95,
    mass: 11110,
    dimensions: '13.2 x 4.2 m',
    mission:
      'Visible/UV/near-IR space telescope responsible for many transformative astronomical discoveries.',
    description:
      'The Hubble Space Telescope is a space telescope that has been operating since 1990 in low Earth orbit, providing some of the most detailed visible-light images of the universe.',
    images: ['https://example.com/spacecraft/hubble.jpg'],
  },
  {
    id: 'starlink-constellation',
    name: 'Starlink',
    type: SpacecraftType.SATELLITE,
    operator: 'SpaceX',
    launchDate: new Date('2019-05-23'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'LEO Constellation',
    orbitAltitude: 550,
    orbitInclination: 53,
    orbitPeriod: 95.5,
    mass: 260,
    dimensions: '约 2.8 x 1.4 m per satellite',
    mission:
      'Global satellite internet constellation providing high-speed broadband to underserved areas.',
    description:
      'Starlink is a satellite internet constellation operated by SpaceX, providing satellite internet access to over 70 countries with thousands of satellites in low Earth orbit.',
    images: ['https://example.com/spacecraft/starlink.jpg'],
  },
  {
    id: 'beidou',
    name: '北斗导航卫星',
    type: SpacecraftType.SATELLITE,
    operator: 'CNSA',
    launchDate: new Date('2000-10-31'),
    status: SpacecraftStatus.OPERATIONAL,
    orbitType: 'MEO / GEO / IGSO',
    orbitAltitude: 21500,
    orbitInclination: 55,
    orbitPeriod: 773,
    mass: 1014,
    dimensions: '2.5 x 1.0 x 2.2 m',
    mission:
      '中国自主建设、独立运行的全球卫星导航系统，提供定位、导航和授时服务。',
    description:
      '北斗卫星导航系统（BDS）是中国自主建设运行的全球卫星导航系统，2020年7月31日北斗三号系统正式开通服务。',
    images: ['https://example.com/spacecraft/beidou.jpg'],
  },
];
// =============================================================================
// LAUNCHES
// =============================================================================
const launches = [
  // ---- Historic ----
  {
    id: 'apollo-11',
    name: 'Apollo 11',
    date: new Date('1969-07-16T13:32:00Z'),
    status: LaunchStatus.SUCCESS,
    missionDescription:
      'First crewed mission to land on the Moon. Astronauts Neil Armstrong and Buzz Aldrin became the first humans to walk on the lunar surface, while Michael Collins orbited above.',
    payloads: [
      { name: 'Apollo Command and Service Module', type: 'spacecraft', count: 1, mass: 28800 },
      { name: 'Apollo Lunar Module Eagle', type: 'lander', count: 1, mass: 15103 },
    ],
    videoUrl: 'https://youtube.com/watch?v=cwZb2mqId0A',
    images: ['https://example.com/launches/apollo-11.jpg'],
    externalId: 'apollo-11',
    rocketId: 'sls', // Saturn V not in our rocket list; using SLS as historic substitute
    launchSiteId: 'ksc-lc39a',
  },
  {
    id: 'shenzhou-5',
    name: '神舟五号',
    date: new Date('2003-10-15T01:00:00Z'),
    status: LaunchStatus.SUCCESS,
    missionDescription:
      '中国首次载人航天飞行任务，航天员杨利伟成为首位进入太空的中国人。飞船绕地球14圈后安全返回。',
    payloads: [
      { name: '神舟五号飞船', type: 'crewed_spacecraft', count: 1, mass: 7790 },
    ],
    videoUrl: null,
    images: ['https://example.com/launches/shenzhou-5.jpg'],
    externalId: 'shenzhou-5',
    rocketId: 'long-march-2f',
    launchSiteId: 'jiuquan',
  },
  {
    id: 'shenzhou-13',
    name: '神舟十三号',
    date: new Date('2021-10-15T16:23:00Z'),
    status: LaunchStatus.SUCCESS,
    missionDescription:
      '中国空间站关键技术验证阶段第二次载人飞行任务，乘组在轨驻留183天，创造了中国航天员在轨驻留时间纪录。',
    payloads: [
      { name: '神舟十三号飞船', type: 'crewed_spacecraft', count: 1, mass: 7790 },
    ],
    videoUrl: null,
    images: ['https://example.com/launches/shenzhou-13.jpg'],
    externalId: 'shenzhou-13',
    rocketId: 'long-march-2f',
    launchSiteId: 'jiuquan',
  },
  {
    id: 'falcon-heavy-demo',
    name: 'Falcon Heavy Demo',
    date: new Date('2018-02-06T20:45:00Z'),
    status: LaunchStatus.SUCCESS,
    missionDescription:
      'Maiden flight of Falcon Heavy. The vehicle lofted Elon Musk\'s personal Tesla Roadster into a heliocentric orbit, with the dummy "Starman" at the wheel.',
    payloads: [
      { name: 'Tesla Roadster', type: 'demo_payload', count: 1, mass: 1300 },
    ],
    videoUrl: 'https://youtube.com/watch?v=wbSwFU6tY1c',
    images: ['https://example.com/launches/falcon-heavy-demo.jpg'],
    externalId: 'falcon-heavy-demo-2018',
    rocketId: 'falcon-heavy',
    launchSiteId: 'ksc-lc39a',
  },
  {
    id: 'jwst-launch',
    name: 'James Webb Space Telescope Launch',
    date: new Date('2021-12-25T12:20:00Z'),
    status: LaunchStatus.SUCCESS,
    missionDescription:
      'Launch of the James Webb Space Telescope on an Ariane 5 from Kourou, French Guiana. The telescope was delivered to Sun-Earth L2.',
    payloads: [
      { name: 'James Webb Space Telescope', type: 'observatory', count: 1, mass: 6500 },
    ],
    videoUrl: 'https://youtube.com/watch?v=7nT7JGZMbtM',
    images: ['https://example.com/launches/jwst.jpg'],
    externalId: 'jwst-2021',
    rocketId: 'ariane-5',
    launchSiteId: 'kourou',
  },
  {
    id: 'change-5-launch',
    name: '嫦娥五号发射',
    date: new Date('2020-11-23T20:30:00Z'),
    status: LaunchStatus.SUCCESS,
    missionDescription:
      '中国首次月面采样返回任务发射，嫦娥五号探测器由长征五号运载火箭送入地月转移轨道。',
    payloads: [
      { name: '嫦娥五号探测器', type: 'probe', count: 1, mass: 8200 },
    ],
    videoUrl: null,
    images: ['https://example.com/launches/change-5.jpg'],
    externalId: 'change-5-2020',
    rocketId: 'long-march-5',
    launchSiteId: 'wenchang',
  },
  {
    id: 'tianwen-1-launch',
    name: '天问一号发射',
    date: new Date('2020-07-23T04:41:00Z'),
    status: LaunchStatus.SUCCESS,
    missionDescription:
      '中国首次自主火星探测任务发射，长征五号将天问一号探测器送入地火转移轨道。',
    payloads: [
      { name: '天问一号探测器', type: 'probe', count: 1, mass: 5000 },
    ],
    videoUrl: null,
    images: ['https://example.com/launches/tianwen-1.jpg'],
    externalId: 'tianwen-1-2020',
    rocketId: 'long-march-5',
    launchSiteId: 'wenchang',
  },
  // ---- SpaceX Crew Missions ----
  {
    id: 'crew-1',
    name: 'SpaceX Crew-1',
    date: new Date('2020-11-16T00:27:00Z'),
    status: LaunchStatus.SUCCESS,
    missionDescription:
      'First operational crewed mission of Crew Dragon. Carried four astronauts (Hopkins, Glover, Walker, Noguchi) to the ISS.',
    payloads: [
      { name: 'Crew Dragon Resilience', type: 'crewed_spacecraft', count: 1, mass: 12519 },
    ],
    videoUrl: null,
    images: ['https://example.com/launches/crew-1.jpg'],
    externalId: 'crew-1-2020',
    rocketId: 'falcon-9',
    launchSiteId: 'ksc-lc39a',
  },
  {
    id: 'crew-3',
    name: 'SpaceX Crew-3',
    date: new Date('2021-11-11T02:03:00Z'),
    status: LaunchStatus.SUCCESS,
    missionDescription:
      'Third operational SpaceX crewed mission to the ISS, carrying NASA astronauts and ESA astronaut Matthias Maurer.',
    payloads: [
      { name: 'Crew Dragon Endurance', type: 'crewed_spacecraft', count: 1, mass: 12519 },
    ],
    videoUrl: null,
    images: [],
    externalId: 'crew-3-2021',
    rocketId: 'falcon-9',
    launchSiteId: 'ksc-lc39a',
  },
  {
    id: 'crew-5',
    name: 'SpaceX Crew-5',
    date: new Date('2022-10-05T16:00:00Z'),
    status: LaunchStatus.SUCCESS,
    missionDescription:
      'Fifth operational SpaceX crewed mission to the ISS, including the first Russian cosmonaut to fly aboard Crew Dragon.',
    payloads: [
      { name: 'Crew Dragon Endurance', type: 'crewed_spacecraft', count: 1, mass: 12519 },
    ],
    videoUrl: null,
    images: [],
    externalId: 'crew-5-2022',
    rocketId: 'falcon-9',
    launchSiteId: 'ksc-lc39a',
  },
  {
    id: 'crew-7',
    name: 'SpaceX Crew-7',
    date: new Date('2023-08-26T07:27:00Z'),
    status: LaunchStatus.SUCCESS,
    missionDescription:
      'Seventh operational SpaceX crewed mission to the ISS, an international crew including Andreas Mogensen (ESA), Satoshi Furukawa (JAXA), and Konstantin Borisov (Roscosmos).',
    payloads: [
      { name: 'Crew Dragon Endurance', type: 'crewed_spacecraft', count: 1, mass: 12519 },
    ],
    videoUrl: null,
    images: [],
    externalId: 'crew-7-2023',
    rocketId: 'falcon-9',
    launchSiteId: 'ksc-lc39a',
  },
  // ---- Recent Starlink batches ----
  {
    id: 'starlink-g6-1',
    name: 'Starlink Group 6-1',
    date: new Date('2024-01-15T17:00:00Z'),
    status: LaunchStatus.SUCCESS,
    missionDescription: 'SpaceX Starlink satellite deployment mission, batch of v2 mini satellites.',
    payloads: [{ name: 'Starlink v2 mini', type: 'satellite', count: 23, mass: 17800 }],
    videoUrl: 'https://youtube.com/watch?v=example1',
    images: [],
    externalId: 'starlink-g6-1',
    rocketId: 'falcon-9',
    launchSiteId: 'ccsfs',
  },
  {
    id: 'starlink-g7-3',
    name: 'Starlink Group 7-3',
    date: new Date('2024-08-20T07:22:00Z'),
    status: LaunchStatus.SUCCESS,
    missionDescription: 'SpaceX Starlink satellite deployment mission from Vandenberg.',
    payloads: [{ name: 'Starlink v2 mini', type: 'satellite', count: 21, mass: 16200 }],
    videoUrl: null,
    images: [],
    externalId: 'starlink-g7-3',
    rocketId: 'falcon-9',
    launchSiteId: 'vandenberg',
  },
  {
    id: 'starlink-g8-12',
    name: 'Starlink Group 8-12',
    date: new Date('2025-03-04T11:15:00Z'),
    status: LaunchStatus.SUCCESS,
    missionDescription: 'SpaceX Starlink mission delivering broadband satellites to LEO constellation.',
    payloads: [{ name: 'Starlink v2 mini', type: 'satellite', count: 23, mass: 17800 }],
    videoUrl: null,
    images: [],
    externalId: 'starlink-g8-12',
    rocketId: 'falcon-9',
    launchSiteId: 'ccsfs',
  },
  {
    id: 'starlink-g9-5',
    name: 'Starlink Group 9-5',
    date: new Date('2025-11-18T05:40:00Z'),
    status: LaunchStatus.SUCCESS,
    missionDescription: 'Routine Starlink rideshare delivering broadband and direct-to-cell satellites.',
    payloads: [{ name: 'Starlink (mixed)', type: 'satellite', count: 22, mass: 17000 }],
    videoUrl: null,
    images: [],
    externalId: 'starlink-g9-5',
    rocketId: 'falcon-9',
    launchSiteId: 'vandenberg',
  },
  {
    id: 'starlink-g10-2',
    name: 'Starlink Group 10-2',
    date: new Date('2026-02-09T09:00:00Z'),
    status: LaunchStatus.SUCCESS,
    missionDescription: 'Starlink batch deployment to maintain global broadband coverage.',
    payloads: [{ name: 'Starlink v2', type: 'satellite', count: 20, mass: 18000 }],
    videoUrl: null,
    images: [],
    externalId: 'starlink-g10-2',
    rocketId: 'falcon-9',
    launchSiteId: 'ccsfs',
  },
  // ---- Failures (for variety) ----
  {
    id: 'starship-flight-1',
    name: 'Starship Flight 1 (S24/B7)',
    date: new Date('2023-04-20T13:33:00Z'),
    status: LaunchStatus.FAILURE,
    missionDescription:
      'First integrated test flight of Starship and Super Heavy. The vehicle cleared the launch pad but lost multiple engines and was destroyed by the flight termination system about 4 minutes into flight.',
    payloads: [
      { name: 'Test article', type: 'demo', count: 1, mass: 0 },
    ],
    videoUrl: 'https://youtube.com/watch?v=-1wcilQ58hI',
    images: [],
    externalId: 'starship-ift1',
    rocketId: 'starship',
    launchSiteId: 'starbase',
  },
  // ---- Upcoming / Planned ----
  {
    id: 'shenzhou-22',
    name: '神舟二十二号',
    date: new Date('2026-06-12T08:00:00Z'),
    status: LaunchStatus.PLANNED,
    missionDescription:
      '神舟二十二号载人飞行任务，乘组将在中国空间站驻留约6个月，开展空间科学实验和出舱活动。',
    payloads: [
      { name: '神舟二十二号飞船', type: 'crewed_spacecraft', count: 1, mass: 7790 },
    ],
    videoUrl: null,
    images: [],
    externalId: 'shenzhou-22',
    rocketId: 'long-march-2f',
    launchSiteId: 'jiuquan',
  },
  {
    id: 'artemis-iii',
    name: 'Artemis III',
    date: new Date('2026-09-15T14:00:00Z'),
    status: LaunchStatus.PLANNED,
    missionDescription:
      'Artemis III is planned to land humans near the lunar south pole for the first time since Apollo 17, using the SLS rocket and a Starship Human Landing System.',
    payloads: [
      { name: 'Orion Spacecraft', type: 'crewed_spacecraft', count: 1, mass: 26520 },
    ],
    videoUrl: null,
    images: [],
    externalId: 'artemis-iii',
    rocketId: 'sls',
    launchSiteId: 'ksc-lc39a',
  },
  {
    id: 'starship-orbital-2026',
    name: 'Starship Orbital Test',
    date: new Date('2026-06-30T18:00:00Z'),
    status: LaunchStatus.PLANNED,
    missionDescription:
      'Planned Starship orbital flight demonstrating full reusability with payload deployment and booster catch.',
    payloads: [
      { name: 'Starlink v3 prototype', type: 'satellite', count: 50, mass: 65000 },
    ],
    videoUrl: null,
    images: [],
    externalId: 'starship-orbital-2026',
    rocketId: 'starship',
    launchSiteId: 'starbase',
  },
  {
    id: 'tianzhou-9',
    name: '天舟九号',
    date: new Date('2026-06-05T05:30:00Z'),
    status: LaunchStatus.PLANNED,
    missionDescription:
      '天舟九号货运飞船任务，为中国空间站运送物资、推进剂和实验设备。',
    payloads: [
      { name: '天舟九号', type: 'cargo_spacecraft', count: 1, mass: 13500 },
    ],
    videoUrl: null,
    images: [],
    externalId: 'tianzhou-9',
    rocketId: 'long-march-7',
    launchSiteId: 'wenchang',
  },
  {
    id: 'ariane-6-vega-replacement',
    name: 'Ariane 6 Galileo Mission',
    date: new Date('2026-07-22T10:30:00Z'),
    status: LaunchStatus.PLANNED,
    missionDescription:
      'Ariane 6 launch carrying a batch of Galileo navigation satellites for the European Union.',
    payloads: [
      { name: 'Galileo FOC satellites', type: 'satellite', count: 4, mass: 2860 },
    ],
    videoUrl: null,
    images: [],
    externalId: 'ariane-6-galileo-2026',
    rocketId: 'ariane-6',
    launchSiteId: 'kourou',
  },
  {
    id: 'h3-mmx',
    name: 'H3 MMX Mission',
    date: new Date('2026-09-10T03:00:00Z'),
    status: LaunchStatus.PLANNED,
    missionDescription:
      'JAXA Martian Moons eXploration mission to study the moons of Mars and return a sample from Phobos.',
    payloads: [
      { name: 'MMX spacecraft', type: 'probe', count: 1, mass: 4000 },
    ],
    videoUrl: null,
    images: [],
    externalId: 'h3-mmx-2026',
    rocketId: 'h3',
    launchSiteId: 'tanegashima',
  },
  // ---- Postponed / In-Flight ----
  {
    id: 'gaganyaan-test',
    name: 'Gaganyaan G1 Uncrewed Test',
    date: new Date('2026-08-18T04:30:00Z'),
    status: LaunchStatus.POSTPONED,
    missionDescription:
      'India\'s first uncrewed Gaganyaan orbital test flight has been postponed due to technical reviews of the crew escape system.',
    payloads: [
      { name: 'Gaganyaan capsule (uncrewed)', type: 'crewed_spacecraft', count: 1, mass: 3735 },
    ],
    videoUrl: null,
    images: [],
    externalId: 'gaganyaan-g1',
    rocketId: 'gslv',
    launchSiteId: 'sriharikota',
  },
  {
    id: 'progress-ms-29',
    name: 'Progress MS-29',
    date: new Date('2026-05-14T09:15:00Z'),
    status: LaunchStatus.IN_FLIGHT,
    missionDescription:
      'Russian Progress cargo resupply mission to the International Space Station, currently en route for docking.',
    payloads: [
      { name: 'Progress MS-29', type: 'cargo_spacecraft', count: 1, mass: 7150 },
    ],
    videoUrl: null,
    images: [],
    externalId: 'progress-ms-29',
    rocketId: 'soyuz-2',
    launchSiteId: 'baikonur',
  },
];
// =============================================================================
// LAUNCH CREWS
// =============================================================================
const launchCrews = [
  // Apollo 11
  { launchId: 'apollo-11', astronautId: 'neil-armstrong', role: 'Commander' },
  { launchId: 'apollo-11', astronautId: 'buzz-aldrin', role: 'Lunar Module Pilot' },
  // Shenzhou 5
  { launchId: 'shenzhou-5', astronautId: 'yang-liwei', role: '指令长' },
  // Shenzhou 13
  { launchId: 'shenzhou-13', astronautId: 'zhai-zhigang', role: '指令长' },
  { launchId: 'shenzhou-13', astronautId: 'wang-yaping', role: '飞行工程师' },
  // Crew-1
  { launchId: 'crew-1', astronautId: 'soichi-noguchi', role: 'Mission Specialist' },
  // Crew-3
  { launchId: 'crew-3', astronautId: 'sunita-williams', role: 'Backup Commander' },
  // Crew-5
  { launchId: 'crew-5', astronautId: 'christina-koch', role: 'Mission Specialist' },
  // Crew-7
  { launchId: 'crew-7', astronautId: 'samantha-cristoforetti', role: 'Mission Specialist' },
  // Shenzhou 22 (planned)
  { launchId: 'shenzhou-22', astronautId: 'jing-haipeng', role: '指令长' },
  { launchId: 'shenzhou-22', astronautId: 'liu-yang', role: '飞行工程师' },
  // Artemis III (planned)
  { launchId: 'artemis-iii', astronautId: 'christina-koch', role: 'Mission Specialist' },
];

// =============================================================================
// MAIN
// =============================================================================
async function main() {
  console.log('Seeding database...');

  console.log(`  -> ${rockets.length} rockets`);
  for (const r of rockets) {
    await prisma.rocket.upsert({ where: { id: r.id }, update: r, create: r });
  }

  console.log(`  -> ${launchSites.length} launch sites`);
  for (const s of launchSites) {
    await prisma.launchSite.upsert({ where: { id: s.id }, update: s, create: s });
  }

  console.log(`  -> ${astronauts.length} astronauts`);
  for (const a of astronauts) {
    await prisma.astronaut.upsert({ where: { id: a.id }, update: a, create: a });
  }

  console.log(`  -> ${spacecraft.length} spacecraft`);
  for (const sc of spacecraft) {
    await prisma.spacecraft.upsert({ where: { id: sc.id }, update: sc, create: sc });
  }

  console.log(`  -> ${launches.length} launches`);
  for (const l of launches) {
    await prisma.launch.upsert({ where: { id: l.id }, update: l, create: l });
  }

  console.log(`  -> ${launchCrews.length} launch crew assignments`);
  for (const lc of launchCrews) {
    await prisma.launchCrew.upsert({
      where: {
        launchId_astronautId: { launchId: lc.launchId, astronautId: lc.astronautId },
      },
      update: lc,
      create: lc,
    });
  }

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
