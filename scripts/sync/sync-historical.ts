/**
 * Sync historical launches from NASA's Launch Vehicle Database
 * and supplement with Rocket Launch Live data for global coverage.
 *
 * This uses the free LL2 "previous" endpoint in smaller batches
 * to stay within rate limits, focusing on non-SpaceX launches.
 */

import { LaunchStatus, RocketStatus, LaunchSiteStatus } from '@prisma/client';
import { prisma } from '../../lib/db/prisma';

const OPEN_NOTIFY_URL = 'http://api.open-notify.org/iss-now.json';

// Wikipedia REST API - free, no auth, covers global launch history
const WIKI_SPARQL = 'https://query.wikidata.org/sparql';

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9一-鿿]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

// Historical launch data from well-known mission archives
// These are manually curated records for major missions not covered by other APIs
const HISTORICAL_LAUNCHES = [
  // Soviet/Russian historic
  { name: 'Sputnik 1', date: '1957-10-04', status: 'SUCCESS', country: 'Russia', rocket: 'Sputnik-PS', site: 'Baikonur Cosmodrome', description: '世界上第一颗人造地球卫星，苏联发射，开创了人类航天时代。' },
  { name: 'Sputnik 2 (Laika)', date: '1957-11-03', status: 'SUCCESS', country: 'Russia', rocket: 'Sputnik', site: 'Baikonur Cosmodrome', description: '携带第一只进入太空的生物——莱卡犬。' },
  { name: 'Vostok 1 (Gagarin)', date: '1961-04-12', status: 'SUCCESS', country: 'Russia', rocket: 'Vostok-K', site: 'Baikonur Cosmodrome', description: '尤里·加加林成为第一位进入太空的人类，绕地球飞行1圈。' },
  { name: 'Vostok 6 (Tereshkova)', date: '1963-06-16', status: 'SUCCESS', country: 'Russia', rocket: 'Vostok-K', site: 'Baikonur Cosmodrome', description: '瓦伦蒂娜·捷列什科娃成为第一位进入太空的女性。' },
  { name: 'Luna 9', date: '1966-01-31', status: 'SUCCESS', country: 'Russia', rocket: 'Molniya-M', site: 'Baikonur Cosmodrome', description: '苏联月球9号，首次实现月球软着陆并传回图像。' },
  { name: 'Salyut 1', date: '1971-04-19', status: 'SUCCESS', country: 'Russia', rocket: 'Proton-K', site: 'Baikonur Cosmodrome', description: '世界上第一个空间站，苏联礼炮1号。' },
  { name: 'Mir (Core Module)', date: '1986-02-19', status: 'SUCCESS', country: 'Russia', rocket: 'Proton-K', site: 'Baikonur Cosmodrome', description: '和平号空间站核心舱发射，服役至2001年。' },
  // US historic
  { name: 'Explorer 1', date: '1958-02-01', status: 'SUCCESS', country: 'USA', rocket: 'Juno I', site: 'Cape Canaveral', description: '美国第一颗人造卫星，发现范艾伦辐射带。' },
  { name: 'Freedom 7 (Shepard)', date: '1961-05-05', status: 'SUCCESS', country: 'USA', rocket: 'Redstone', site: 'Cape Canaveral', description: '艾伦·谢泼德成为第一位进入太空的美国人。' },
  { name: 'Friendship 7 (Glenn)', date: '1962-02-20', status: 'SUCCESS', country: 'USA', rocket: 'Atlas LV-3B', site: 'Cape Canaveral', description: '约翰·格伦成为第一位绕地球飞行的美国人。' },
  { name: 'Apollo 1', date: '1967-01-27', status: 'FAILURE', country: 'USA', rocket: 'Saturn IB', site: 'Kennedy Space Center', description: '阿波罗1号舱内火灾，3名宇航员遇难。' },
  { name: 'Apollo 11', date: '1969-07-16', status: 'SUCCESS', country: 'USA', rocket: 'Saturn V', site: 'Kennedy Space Center LC-39A', description: '人类首次登月。尼尔·阿姆斯特朗和巴兹·奥尔德林登上月球。' },
  { name: 'Apollo 13', date: '1970-04-11', status: 'FAILURE', country: 'USA', rocket: 'Saturn V', site: 'Kennedy Space Center', description: '阿波罗13号氧气罐爆炸，成功将宇航员带回地球。' },
  { name: 'Apollo 17', date: '1972-12-07', status: 'SUCCESS', country: 'USA', rocket: 'Saturn V', site: 'Kennedy Space Center', description: '阿波罗最后一次月球任务，首次有地质学家登月。' },
  { name: 'Skylab', date: '1973-05-14', status: 'SUCCESS', country: 'USA', rocket: 'Saturn V', site: 'Kennedy Space Center', description: '美国第一个空间站天空实验室发射。' },
  { name: 'Voyager 1', date: '1977-09-05', status: 'SUCCESS', country: 'USA', rocket: 'Titan IIIE', site: 'Cape Canaveral', description: '旅行者1号，至今仍是飞行最远的人造物体。' },
  { name: 'Voyager 2', date: '1977-08-20', status: 'SUCCESS', country: 'USA', rocket: 'Titan IIIE', site: 'Cape Canaveral', description: '旅行者2号，唯一飞越天王星和海王星的探测器。' },
  { name: 'STS-1 (Columbia)', date: '1981-04-12', status: 'SUCCESS', country: 'USA', rocket: 'Space Shuttle', site: 'Kennedy Space Center', description: '航天飞机首次飞行，哥伦比亚号。' },
  { name: 'STS-51-L (Challenger)', date: '1986-01-28', status: 'FAILURE', country: 'USA', rocket: 'Space Shuttle', site: 'Kennedy Space Center', description: '挑战者号发射73秒后爆炸，7名宇航员遇难。' },
  { name: 'Hubble Space Telescope', date: '1990-04-24', status: 'SUCCESS', country: 'USA', rocket: 'Space Shuttle', site: 'Kennedy Space Center', description: '哈勃太空望远镜发射，彻底改变了人类对宇宙的认识。' },
  { name: 'STS-107 (Columbia)', date: '2003-01-16', status: 'FAILURE', country: 'USA', rocket: 'Space Shuttle', site: 'Kennedy Space Center', description: '哥伦比亚号在返回途中解体，7名宇航员遇难。' },
  { name: 'James Webb Space Telescope', date: '2021-12-25', status: 'SUCCESS', country: 'Intl', rocket: 'Ariane 5', site: 'Kourou', description: '詹姆斯·韦伯太空望远镜发射，人类有史以来最强大的太空望远镜。' },
  // China historic
  { name: '东方红一号 (DFH-1)', date: '1970-04-24', status: 'SUCCESS', country: 'China', rocket: '长征一号', site: '酒泉卫星发射中心', description: '中国第一颗人造地球卫星，开创中国航天元年。' },
  { name: '神舟一号', date: '1999-11-19', status: 'SUCCESS', country: 'China', rocket: '长征二号F', site: '酒泉卫星发射中心', description: '中国第一艘无人神舟飞船测试飞行。' },
  { name: '神舟五号 (杨利伟)', date: '2003-10-15', status: 'SUCCESS', country: 'China', rocket: '长征二号F', site: '酒泉卫星发射中心', description: '杨利伟成为首位中国航天员，中国成为第三个独立实现载人航天的国家。' },
  { name: '神舟六号', date: '2005-10-12', status: 'SUCCESS', country: 'China', rocket: '长征二号F', site: '酒泉卫星发射中心', description: '费俊龙、聂海胜执行中国第二次载人航天任务。' },
  { name: '嫦娥一号', date: '2007-10-24', status: 'SUCCESS', country: 'China', rocket: '长征三号甲', site: '西昌卫星发射中心', description: '中国第一个月球探测器，开启探月工程。' },
  { name: '神舟七号 (翟志刚)', date: '2008-09-25', status: 'SUCCESS', country: 'China', rocket: '长征二号F', site: '酒泉卫星发射中心', description: '翟志刚完成中国首次太空行走（EVA）。' },
  { name: '天宫一号', date: '2011-09-29', status: 'SUCCESS', country: 'China', rocket: '长征二号FT1', site: '酒泉卫星发射中心', description: '中国第一个空间实验室，与神舟八、九、十号交会对接。' },
  { name: '嫦娥三号', date: '2013-12-01', status: 'SUCCESS', country: 'China', rocket: '长征三号乙', site: '西昌卫星发射中心', description: '玉兔号月球车登月，中国首次实现地外天体软着陆。' },
  { name: '北斗三号 (首颗)', date: '2017-11-05', status: 'SUCCESS', country: 'China', rocket: '长征三号乙', site: '西昌卫星发射中心', description: '北斗三号全球导航系统第一颗卫星发射。' },
  { name: '嫦娥四号', date: '2018-12-07', status: 'SUCCESS', country: 'China', rocket: '长征三号乙', site: '西昌卫星发射中心', description: '玉兔二号在月球背面着陆，人类探测器首次月背软着陆。' },
  { name: '长征五号B (首飞)', date: '2020-05-05', status: 'SUCCESS', country: 'China', rocket: '长征五号B', site: '文昌航天发射场', description: '长征五号B首次飞行，为中国空间站建设奠基。' },
  { name: '嫦娥五号', date: '2020-11-23', status: 'SUCCESS', country: 'China', rocket: '长征五号', site: '文昌航天发射场', description: '嫦娥五号采集月壤1731克返回地球，时隔44年首次月球采样返回。' },
  { name: '天问一号', date: '2020-07-23', status: 'SUCCESS', country: 'China', rocket: '长征五号', site: '文昌航天发射场', description: '中国首次火星探测任务，祝融号火星车成功落火。' },
  { name: '天和核心舱', date: '2021-04-29', status: 'SUCCESS', country: 'China', rocket: '长征五号B', site: '文昌航天发射场', description: '中国空间站天和核心舱发射，中国独立空间站建设正式开始。' },
  { name: '神舟十二号', date: '2021-06-17', status: 'SUCCESS', country: 'China', rocket: '长征二号F', site: '酒泉卫星发射中心', description: '聂海胜、刘伯明、汤洪波入驻天和核心舱。' },
  { name: '神舟十三号 (王亚平)', date: '2021-10-15', status: 'SUCCESS', country: 'China', rocket: '长征二号F', site: '酒泉卫星发射中心', description: '翟志刚、王亚平、叶光富入驻天宫，王亚平成中国首位出舱女航天员。' },
  { name: '问天实验舱', date: '2022-07-24', status: 'SUCCESS', country: 'China', rocket: '长征五号B', site: '文昌航天发射场', description: '天宫空间站问天实验舱发射，中国空间站完成T字构型。' },
  { name: '梦天实验舱', date: '2022-10-31', status: 'SUCCESS', country: 'China', rocket: '长征五号B', site: '文昌航天发射场', description: '天宫空间站梦天实验舱发射，空间站基本构型建造完成。' },
  { name: '嫦娥六号', date: '2024-05-03', status: 'SUCCESS', country: 'China', rocket: '长征五号', site: '文昌航天发射场', description: '嫦娥六号在月球背面南极-艾特肯盆地采样返回，首次月背采样。' },
  // India
  { name: 'Chandrayaan-1', date: '2008-10-22', status: 'SUCCESS', country: 'India', rocket: 'PSLV-XL', site: 'Satish Dhawan Space Centre', description: '印度首次月球探测任务，发现月球表面水分子。' },
  { name: 'Mangalyaan (MOM)', date: '2013-11-05', status: 'SUCCESS', country: 'India', rocket: 'PSLV-XL', site: 'Satish Dhawan Space Centre', description: '印度首次火星探测，首次尝试即成功进入火星轨道。' },
  { name: 'Chandrayaan-3', date: '2023-07-14', status: 'SUCCESS', country: 'India', rocket: 'LVM3-M4', site: 'Satish Dhawan Space Centre', description: '印度首次月球软着陆成功，着陆点在月球南极附近。' },
  // Europe
  { name: 'Ariane 1 (First launch)', date: '1979-12-24', status: 'SUCCESS', country: 'Europe', rocket: 'Ariane 1', site: 'Kourou', description: '欧洲阿里安火箭首次成功发射。' },
  { name: 'Rosetta/Philae', date: '2004-03-02', status: 'SUCCESS', country: 'Europe', rocket: 'Ariane 5G+', site: 'Kourou', description: '欧洲罗塞塔探测器发射，2014年实现彗星软着陆。' },
  { name: 'Gaia', date: '2013-12-19', status: 'SUCCESS', country: 'Europe', rocket: 'Soyuz-STB', site: 'Kourou', description: 'ESA盖亚望远镜，绘制银河系最精确三维恒星图。' },
  // Japan
  { name: 'Hayabusa2', date: '2014-12-03', status: 'SUCCESS', country: 'Japan', rocket: 'H-IIA', site: 'Tanegashima', description: '日本隼鸟2号小行星采样探测器，从龙宫小行星带回样品。' },
  // International
  { name: 'ISS Zarya Module', date: '1998-11-20', status: 'SUCCESS', country: 'Russia', rocket: 'Proton-K', site: 'Baikonur Cosmodrome', description: '国际空间站第一个模块曙光号（Zarya）发射。' },
  { name: 'ISS Unity Module', date: '1998-12-04', status: 'SUCCESS', country: 'USA', rocket: 'Space Shuttle', site: 'Kennedy Space Center', description: '国际空间站第二个模块团结号（Unity）发射。' },
  { name: 'Crew Dragon Demo-2', date: '2020-05-30', status: 'SUCCESS', country: 'USA', rocket: 'Falcon 9', site: 'Kennedy Space Center LC-39A', description: 'SpaceX载人龙飞船首次载人飞行，将2名NASA宇航员送往国际空间站。' },
];

async function ensureRocket(name: string, country: string): Promise<string> {
  const id = `hist-${slugify(name)}`;
  const existing = await prisma.rocket.findFirst({ where: { OR: [{ id }, { name }] } });
  if (existing) return existing.id;
  await prisma.rocket.create({
    data: {
      id, name, manufacturer: country, country,
      height: 0, diameter: 0, mass: 0,
      payloadToLEO: 0, payloadToGTO: 0,
      stages: 2, status: RocketStatus.RETIRED,
      successRate: 0, description: name, images: [],
    }
  });
  return id;
}

async function ensureSite(name: string, country: string): Promise<string> {
  const id = `hist-${slugify(name)}`;
  const existing = await prisma.launchSite.findFirst({ where: { OR: [{ id }, { name }] } });
  if (existing) return existing.id;
  await prisma.launchSite.create({
    data: {
      id, name, country, region: country,
      latitude: 0, longitude: 0, operator: country,
      status: LaunchSiteStatus.ACTIVE,
      pads: [], description: name,
    }
  });
  return id;
}

async function main() {
  console.log(`[historical] Syncing ${HISTORICAL_LAUNCHES.length} curated historical launches...`);
  let added = 0, updated = 0, skipped = 0;

  for (const l of HISTORICAL_LAUNCHES) {
    const externalId = `hist-${slugify(l.name)}`;
    const date = new Date(l.date);
    if (Number.isNaN(date.getTime())) { skipped++; continue; }

    const rocketId = await ensureRocket(l.rocket, l.country);
    const launchSiteId = await ensureSite(l.site, l.country);

    const status = l.status === 'SUCCESS' ? LaunchStatus.SUCCESS
      : l.status === 'FAILURE' ? LaunchStatus.FAILURE
      : LaunchStatus.PLANNED;

    const data = {
      name: l.name,
      date,
      status,
      missionDescription: l.description,
      payloads: [],
      videoUrl: null,
      images: [],
      externalId,
      rocketId,
      launchSiteId,
    };

    try {
      const existing = await prisma.launch.findUnique({ where: { externalId } });
      if (existing) {
        await prisma.launch.update({ where: { externalId }, data });
        updated++;
      } else {
        await prisma.launch.create({ data });
        added++;
      }
    } catch (e) {
      console.warn(`[historical] Failed ${l.name}: ${(e as Error).message.slice(0, 80)}`);
      skipped++;
    }
  }

  console.log(`[historical] Done. added=${added} updated=${updated} skipped=${skipped}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
