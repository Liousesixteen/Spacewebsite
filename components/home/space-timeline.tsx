'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Clock, ChevronDown, Filter } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Category =
  | 'crewed'
  | 'lunar'
  | 'mars'
  | 'station'
  | 'satellite'
  | 'deepspace';

interface SpaceEvent {
  date: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  category: Category;
  country: string;
  planned?: boolean;
}

interface CategoryConfig {
  key: Category | 'all';
  label: string;
  labelZh: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Category config
// ---------------------------------------------------------------------------

const categories: CategoryConfig[] = [
  { key: 'all', label: 'All', labelZh: '全部', color: '' },
  { key: 'crewed', label: 'Crewed Flight', labelZh: '载人航天', color: 'bg-cosmic-blue' },
  { key: 'lunar', label: 'Lunar', labelZh: '月球探测', color: 'bg-cosmic-purple' },
  { key: 'mars', label: 'Mars', labelZh: '火星探测', color: 'bg-cosmic-pink' },
  { key: 'station', label: 'Space Stations', labelZh: '空间站', color: 'bg-cosmic-cyan' },
  { key: 'satellite', label: 'Satellites', labelZh: '卫星', color: 'bg-star-glow' },
  { key: 'deepspace', label: 'Deep Space', labelZh: '深空探测', color: 'bg-orange-400' },
];

const countryFlags: Record<string, string> = {
  USSR: '🇷🇺',
  RUS: '🇷🇺',
  USA: '🇺🇸',
  CN: '🇨🇳',
  IN: '🇮🇳',
  EU: '🇪🇺',
  JP: '🇯🇵',
  IL: '🇮🇱',
  AE: '🇦🇪',
  INT: '🌐',
};

function formatDecade(year: number): string {
  const d = Math.floor(year / 10) * 10;
  return `${d}s`;
}

// ---------------------------------------------------------------------------
// Events data (~80 events)
// ---------------------------------------------------------------------------

const events: SpaceEvent[] = [
  // ── Planned / Future ──────────────────────────────────────────────
  {
    date: '2027+',
    title: 'Artemis III',
    titleZh: '阿尔忒弥斯三号',
    description: 'First crewed lunar landing since Apollo 17, targeting the lunar south pole.',
    descriptionZh: '自阿波罗17号以来首次载人登月，目标是月球南极。',
    category: 'lunar',
    country: 'USA',
    planned: true,
  },
  {
    date: '2027+',
    title: 'Tianwen-2',
    titleZh: '天问二号',
    description: 'China\'s first asteroid sample-return mission to Kamo\'oalewa and a comet.',
    descriptionZh: '中国首次小行星采样返回任务，目标近地小行星和彗星。',
    category: 'deepspace',
    country: 'CN',
    planned: true,
  },
  {
    date: '2027+',
    title: 'Mars Sample Return',
    titleZh: '火星样本返回',
    description: 'NASA-ESA joint mission to bring Perseverance samples back to Earth.',
    descriptionZh: 'NASA与ESA联合任务，将毅力号采集的火星样本带回地球。',
    category: 'mars',
    country: 'INT',
    planned: true,
  },
  {
    date: '2026+',
    title: 'Artemis II',
    titleZh: '阿尔忒弥斯二号',
    description: 'First crewed Artemis mission — a lunar flyby with four astronauts aboard Orion.',
    descriptionZh: '首次载人阿尔忒弥斯任务——四名宇航员搭乘猎户座飞船绕月飞行。',
    category: 'lunar',
    country: 'USA',
    planned: true,
  },
  {
    date: '2026+',
    title: 'Chang\'e 7',
    titleZh: '嫦娥七号',
    description: 'China lunar south pole survey mission with orbiter, lander, rover and a hopping probe.',
    descriptionZh: '中国月球南极探测任务，包括轨道器、着陆器、月球车和飞跃探测器。',
    category: 'lunar',
    country: 'CN',
    planned: true,
  },

  // ── 2020s ──────────────────────────────────────────────────────────
  {
    date: '2025-12',
    title: 'ISRO Gaganyaan (uncrewed)',
    titleZh: '印度加冈扬飞船（无人试飞）',
    description: 'India\'s first orbital crew capsule uncrewed test flight toward human spaceflight.',
    descriptionZh: '印度首次轨道载人飞船无人测试飞行，迈向载人航天。',
    category: 'crewed',
    country: 'IN',
  },
  {
    date: '2025-11',
    title: 'Artemis I',
    titleZh: '阿尔忒弥斯一号',
    description: 'Uncrewed Orion spacecraft orbits the Moon, paving the way for crewed lunar return.',
    descriptionZh: '无人猎户座飞船绕月飞行，为载人重返月球铺平道路。',
    category: 'lunar',
    country: 'USA',
  },
  {
    date: '2025-09',
    title: 'Polaris Dawn',
    titleZh: '极光黎明号',
    description: 'First private spacewalk by SpaceX Crew Dragon at 1,400 km — highest crewed Earth orbit since Apollo.',
    descriptionZh: 'SpaceX载人龙飞船首次商业太空行走，1400公里轨道——阿波罗以来最高的载人地球轨道。',
    category: 'crewed',
    country: 'USA',
  },
  {
    date: '2024-06',
    title: 'Chang\'e 6',
    titleZh: '嫦娥六号',
    description: 'First-ever sample return from the far side of the Moon, landing in Inner Mongolia.',
    descriptionZh: '人类首次从月球背面采样返回，在内蒙古着陆。',
    category: 'lunar',
    country: 'CN',
  },
  {
    date: '2024-04',
    title: 'Shenzhou 18',
    titleZh: '神舟十八号',
    description: 'Crewed mission to the Tiangong space station with aquatic ecosystem experiments.',
    descriptionZh: '载人飞行至天宫空间站，开展水生生态系统实验。',
    category: 'crewed',
    country: 'CN',
  },
  {
    date: '2023-10',
    title: 'Starship IFT-2',
    titleZh: '星际飞船第二次集成飞行测试',
    description: 'SpaceX\'s Starship achieves stage separation and reaches space before both stages are lost.',
    descriptionZh: 'SpaceX星舰实现级间分离并进入太空，但两级均未成功回收。',
    category: 'crewed',
    country: 'USA',
  },
  {
    date: '2023-08',
    title: 'Chandrayaan-3',
    titleZh: '月船三号',
    description: 'India becomes the 4th nation to soft-land on the Moon and the first near the south pole.',
    descriptionZh: '印度成为第四个在月球软着陆的国家，也是首个在月球南极附近着陆的国家。',
    category: 'lunar',
    country: 'IN',
  },
  {
    date: '2023-05',
    title: 'Shenzhou 16',
    titleZh: '神舟十六号',
    description: 'First Chinese civilian astronaut (payload specialist) flies to Tiangong.',
    descriptionZh: '首位中国平民宇航员（载荷专家）飞往天宫空间站。',
    category: 'crewed',
    country: 'CN',
  },
  {
    date: '2023-04',
    title: 'JUICE',
    titleZh: 'JUICE木星探测器',
    description: 'ESA\'s Jupiter Icy Moons Explorer launches to study Ganymede, Callisto and Europa.',
    descriptionZh: '欧空局木星冰月探测器发射，研究木卫三、木卫四和木卫二。',
    category: 'deepspace',
    country: 'EU',
  },
  {
    date: '2022-12',
    title: 'Artemis I',
    titleZh: '阿尔忒弥斯一号',
    description: 'Uncrewed Orion capsule completes a 25-day lunar orbit and returns successfully.',
    descriptionZh: '无人猎户座飞船完成25天绕月飞行任务并成功返回。',
    category: 'lunar',
    country: 'USA',
  },
  {
    date: '2022-11',
    title: 'Shenzhou 15',
    titleZh: '神舟十五号',
    description: 'First crew handover on Tiangong — six astronauts simultaneously aboard the station.',
    descriptionZh: '天宫空间站首次在轨轮换——六名宇航员同时在站。',
    category: 'crewed',
    country: 'CN',
  },
  {
    date: '2022-06',
    title: 'CAPSTONE',
    titleZh: 'CAPSTONE月球轨道器',
    description: 'NASA\'s microwave-oven-sized CubeSat enters NRHO around the Moon for Gateway prep.',
    descriptionZh: 'NASA微波炉大小的立方星进入月球近直线晕轨道，为门户空间站做准备。',
    category: 'lunar',
    country: 'USA',
  },
  {
    date: '2021-12',
    title: 'James Webb Space Telescope',
    titleZh: '詹姆斯·韦伯空间望远镜',
    description: 'The most powerful space telescope ever built launches to L2, transforming astronomy.',
    descriptionZh: '有史以来最强大的空间望远镜发射至日地L2点，彻底改变天文学。',
    category: 'deepspace',
    country: 'INT',
  },
  {
    date: '2021-10',
    title: 'Shenzhou 13',
    titleZh: '神舟十三号',
    description: 'China\'s first 6-month crewed mission; includes Wang Yaping\'s first female spacewalk.',
    descriptionZh: '中国首次六个月载人任务；王亚平完成中国女性首次太空行走。',
    category: 'crewed',
    country: 'CN',
  },
  {
    date: '2021-06',
    title: 'Shenzhou 12',
    titleZh: '神舟十二号',
    description: 'First crewed mission to the Tiangong space station core module Tianhe.',
    descriptionZh: '首次载人任务前往天宫空间站天和核心舱。',
    category: 'crewed',
    country: 'CN',
  },
  {
    date: '2021-05',
    title: 'Tianwen-1 / Zhurong',
    titleZh: '天问一号 / 祝融号',
    description: 'China becomes the 2nd nation to successfully land and operate a rover on Mars.',
    descriptionZh: '中国成为第二个成功在火星着陆并运行火星车的国家。',
    category: 'mars',
    country: 'CN',
  },
  {
    date: '2021-04',
    title: 'Tianhe Core Module',
    titleZh: '天和核心舱',
    description: 'Core module of China\'s Tiangong space station launched, beginning modular assembly.',
    descriptionZh: '中国天宫空间站核心舱发射，开启模块化组装。',
    category: 'station',
    country: 'CN',
  },
  {
    date: '2021-02',
    title: 'Perseverance & Ingenuity',
    titleZh: '毅力号与机智号',
    description: 'NASA rover lands in Jezero Crater; Ingenuity becomes the first aircraft on another planet.',
    descriptionZh: 'NASA火星车着陆杰泽罗陨石坑；机智号成为首架在其他星球飞行的直升机。',
    category: 'mars',
    country: 'USA',
  },
  {
    date: '2020-12',
    title: 'Chang\'e 5',
    titleZh: '嫦娥五号',
    description: 'China returns 1.7 kg of lunar samples — the first Moon sample return since Luna 24 (1976).',
    descriptionZh: '中国从月球带回1.7公斤样本——自1976年月球24号以来首次月球采样返回。',
    category: 'lunar',
    country: 'CN',
  },
  {
    date: '2020-11',
    title: 'Crew Dragon "Resilience" (Crew-1)',
    titleZh: '载人龙飞船（Crew-1）',
    description: 'First operational SpaceX crew rotation mission to the ISS with 4 astronauts.',
    descriptionZh: 'SpaceX首次正式载人轮换任务，四名宇航员前往国际空间站。',
    category: 'crewed',
    country: 'USA',
  },
  {
    date: '2020-07',
    title: 'Hope (Emirates Mars Mission)',
    titleZh: '希望号（阿联酋火星任务）',
    description: 'UAE\'s first interplanetary mission — a Mars orbiter studying the atmosphere.',
    descriptionZh: '阿联酋首次行星际任务——研究火星大气的轨道器。',
    category: 'mars',
    country: 'AE',
  },
  {
    date: '2020-05',
    title: 'Crew Dragon Demo-2',
    titleZh: '载人龙飞船示范二号',
    description: 'SpaceX\'s first crewed mission restores US human spaceflight capability after 9 years.',
    descriptionZh: 'SpaceX首次载人任务，美国在中断9年后恢复载人航天能力。',
    category: 'crewed',
    country: 'USA',
  },

  // ── 2010s ──────────────────────────────────────────────────────────
  {
    date: '2019-01',
    title: 'Chang\'e 4',
    titleZh: '嫦娥四号',
    description: 'First-ever soft landing on the far side of the Moon, with the Yutu-2 rover.',
    descriptionZh: '人类首次在月球背面软着陆，携带玉兔二号月球车。',
    category: 'lunar',
    country: 'CN',
  },
  {
    date: '2018-02',
    title: 'Falcon Heavy Test',
    titleZh: '猎鹰重型首飞',
    description: 'SpaceX launches a Tesla Roadster into heliocentric orbit; dual booster landing succeeds.',
    descriptionZh: 'SpaceX将特斯拉跑车送入日心轨道；两枚助推器成功回收。',
    category: 'deepspace',
    country: 'USA',
  },
  {
    date: '2016-09',
    title: 'Tiangong-2',
    titleZh: '天宫二号',
    description: 'China\'s second space laboratory hosts a 30-day crewed mission (Shenzhou 11).',
    descriptionZh: '中国第二个空间实验室，支持神舟十一号30天载人任务。',
    category: 'station',
    country: 'CN',
  },
  {
    date: '2015-12',
    title: 'Falcon 9 First Landing',
    titleZh: '猎鹰九号首次回收',
    description: 'SpaceX lands an orbital-class booster for the first time at Cape Canaveral.',
    descriptionZh: 'SpaceX在卡纳维拉尔角首次实现轨道级火箭助推器垂直着陆。',
    category: 'satellite',
    country: 'USA',
  },
  {
    date: '2015-07',
    title: 'New Horizons at Pluto',
    titleZh: '新视野号飞越冥王星',
    description: 'First close-up images of Pluto reveal a stunning, geologically active world.',
    descriptionZh: '首次近距离拍摄冥王星，揭示出令人惊叹的地质活跃世界。',
    category: 'deepspace',
    country: 'USA',
  },
  {
    date: '2014-09',
    title: 'Mangalyaan (MOM)',
    titleZh: '曼加里安号（火星轨道器）',
    description: 'ISRO\'s Mars orbiter arrives on the first attempt — India\'s first interplanetary mission.',
    descriptionZh: '印度首次行星际任务——火星轨道器首次尝试即成功入轨。',
    category: 'mars',
    country: 'IN',
  },
  {
    date: '2014-04',
    title: 'SpaceX CRS-3',
    titleZh: 'SpaceX货运龙飞船CRS-3',
    description: 'First test of Falcon 9 first stage controlled ocean soft-landing.',
    descriptionZh: '猎鹰九号首次进行受控海上软着陆测试。',
    category: 'satellite',
    country: 'USA',
  },
  {
    date: '2013-12',
    title: 'Chang\'e 3 / Yutu',
    titleZh: '嫦娥三号 / 玉兔号',
    description: 'China\'s first lunar soft landing and rover deployment — first since Luna 24 (1976).',
    descriptionZh: '中国首次月球软着陆并部署月球车，自1976年以来首次。',
    category: 'lunar',
    country: 'CN',
  },
  {
    date: '2012-06',
    title: 'Shenzhou 9',
    titleZh: '神舟九号',
    description: 'First Chinese crewed docking with Tiangong-1; Liu Yang becomes first Chinese woman in space.',
    descriptionZh: '中国首次载人交会对接天宫一号；刘洋成为首位中国女航天员。',
    category: 'crewed',
    country: 'CN',
  },
  {
    date: '2012-05',
    title: 'SpaceX Dragon C2+',
    titleZh: 'SpaceX龙飞船C2+',
    description: 'First private spacecraft to dock with the ISS, opening the commercial cargo era.',
    descriptionZh: '首艘与国际空间站对接的私营航天器，开启商业货运时代。',
    category: 'station',
    country: 'USA',
  },
  {
    date: '2011-09',
    title: 'Tiangong-1',
    titleZh: '天宫一号',
    description: 'China\'s first space laboratory module, hosting both crewed and uncrewed dockings.',
    descriptionZh: '中国首个空间实验室，支持载人和无人交会对接。',
    category: 'station',
    country: 'CN',
  },
  {
    date: '2011-03',
    title: 'MESSENGER at Mercury',
    titleZh: '信使号入轨水星',
    description: 'NASA\'s probe becomes the first spacecraft to orbit Mercury.',
    descriptionZh: 'NASA探测器成为首个环绕水星的航天器。',
    category: 'deepspace',
    country: 'USA',
  },

  // ── 2000s ──────────────────────────────────────────────────────────
  {
    date: '2008-09',
    title: 'Shenzhou 7',
    titleZh: '神舟七号',
    description: 'China\'s first spacewalk (EVA) by Zhai Zhigang, marking a major milestone.',
    descriptionZh: '翟志刚完成中国首次太空行走，标志性里程碑事件。',
    category: 'crewed',
    country: 'CN',
  },
  {
    date: '2007-10',
    title: 'Chang\'e 1',
    titleZh: '嫦娥一号',
    description: 'China\'s first lunar orbiter — the start of the Chinese Lunar Exploration Program.',
    descriptionZh: '中国首颗月球轨道器——中国探月工程的开端。',
    category: 'lunar',
    country: 'CN',
  },
  {
    date: '2004-07',
    title: 'MESSENGER Launch',
    titleZh: '信使号发射',
    description: 'NASA\'s Mercury-bound probe begins its 7-year journey to the innermost planet.',
    descriptionZh: 'NASA水星探测器开始为期7年飞往最内层行星的旅程。',
    category: 'deepspace',
    country: 'USA',
  },
  {
    date: '2003-10',
    title: 'Shenzhou 5',
    titleZh: '神舟五号',
    description: 'Yang Liwei becomes China\'s first astronaut, making China the 3rd nation with crewed spaceflight.',
    descriptionZh: '杨利伟成为中国首位航天员，中国成为第三个独立实现载人航天的国家。',
    category: 'crewed',
    country: 'CN',
  },
  {
    date: '2003-02',
    title: 'Columbia Disaster',
    titleZh: '哥伦比亚号灾难',
    description: 'Space Shuttle Columbia disintegrates during re-entry; all 7 crew members lost.',
    descriptionZh: '哥伦比亚号航天飞机再入大气层时解体，七名宇航员全部遇难。',
    category: 'crewed',
    country: 'USA',
  },
  {
    date: '2001-03',
    title: 'Mir Deorbit',
    titleZh: '和平号空间站退役',
    description: 'The legendary Russian Mir space station is deorbited after 15 years of operation.',
    descriptionZh: '传奇的俄罗斯和平号空间站在运行15年后受控离轨。',
    category: 'station',
    country: 'RUS',
  },
  {
    date: '2000-11',
    title: 'ISS Expedition 1',
    titleZh: '国际空间站第一考察组',
    description: 'First long-duration crew arrives at ISS, beginning permanent human presence in orbit.',
    descriptionZh: '首批长期考察组抵达国际空间站，开启人类永久在轨驻留。',
    category: 'station',
    country: 'INT',
  },

  // ── 1990s ──────────────────────────────────────────────────────────
  {
    date: '1999-11',
    title: 'Shenzhou 1',
    titleZh: '神舟一号',
    description: 'China\'s first uncrewed test of the Shenzhou spacecraft — a key step toward crewed flight.',
    descriptionZh: '中国神舟飞船首次无人测试——迈向载人飞行的关键一步。',
    category: 'crewed',
    country: 'CN',
  },
  {
    date: '1998-11',
    title: 'ISS Zarya Module',
    titleZh: '国际空间站曙光号舱段',
    description: 'The first ISS module launched into orbit — the largest space construction project begins.',
    descriptionZh: '国际空间站首个舱段发射入轨——史上最大航天工程拉开序幕。',
    category: 'station',
    country: 'INT',
  },
  {
    date: '1997-07',
    title: 'Mars Pathfinder',
    titleZh: '火星探路者号',
    description: 'NASA lands the first rover (Sojourner) on Mars, returning thousands of images.',
    descriptionZh: 'NASA在火星着陆首辆火星车（旅居者号），传回数千张图像。',
    category: 'mars',
    country: 'USA',
  },
  {
    date: '1995-12',
    title: 'Galileo at Jupiter',
    titleZh: '伽利略号抵达木星',
    description: 'NASA\'s Galileo spacecraft arrives at Jupiter and deploys an atmospheric probe.',
    descriptionZh: 'NASA伽利略号航天器抵达木星，释放大气探测器。',
    category: 'deepspace',
    country: 'USA',
  },
  {
    date: '1990-04',
    title: 'Hubble Space Telescope',
    titleZh: '哈勃空间望远镜',
    description: 'Revolutionary optical space telescope launched; later serviced in orbit 5 times.',
    descriptionZh: '革命性光学空间望远镜发射，后来在轨维修5次。',
    category: 'deepspace',
    country: 'USA',
  },

  // ── 1980s ──────────────────────────────────────────────────────────
  {
    date: '1988-09',
    title: 'Discovery (STS-26)',
    titleZh: '发现号（STS-26）',
    description: 'Shuttle program returns to flight after Challenger disaster.',
    descriptionZh: '挑战者号事故后航天飞机恢复飞行。',
    category: 'crewed',
    country: 'USA',
  },
  {
    date: '1986-02',
    title: 'Mir Space Station',
    titleZh: '和平号空间站',
    description: 'USSR launches the core module of Mir, the first modular space station.',
    descriptionZh: '苏联发射和平号核心舱，首个模块化空间站。',
    category: 'station',
    country: 'USSR',
  },
  {
    date: '1986-01',
    title: 'Challenger Disaster',
    titleZh: '挑战者号灾难',
    description: 'Space Shuttle Challenger explodes 73 seconds after launch; all 7 crew killed.',
    descriptionZh: '挑战者号航天飞机发射73秒后爆炸，七名宇航员全部遇难。',
    category: 'crewed',
    country: 'USA',
  },
  {
    date: '1981-04',
    title: 'STS-1 Columbia',
    titleZh: '哥伦比亚号首飞（STS-1）',
    description: 'The first Space Shuttle orbital flight — the first reusable crewed spacecraft.',
    descriptionZh: '航天飞机首次轨道飞行——首架可重复使用载人航天器。',
    category: 'crewed',
    country: 'USA',
  },

  // ── 1970s ──────────────────────────────────────────────────────────
  {
    date: '1977-09',
    title: 'Voyager 1',
    titleZh: '旅行者一号',
    description: 'Launched on a grand tour; later became the first human-made object to enter interstellar space.',
    descriptionZh: '发射执行大巡游任务；后来成为首个进入星际空间的人造物体。',
    category: 'deepspace',
    country: 'USA',
  },
  {
    date: '1977-08',
    title: 'Voyager 2',
    titleZh: '旅行者二号',
    description: 'The only spacecraft to visit all four outer planets — Jupiter, Saturn, Uranus, Neptune.',
    descriptionZh: '唯一访问过全部四颗外行星的航天器——木星、土星、天王星、海王星。',
    category: 'deepspace',
    country: 'USA',
  },
  {
    date: '1976-07',
    title: 'Viking 1',
    titleZh: '海盗一号',
    description: 'First successful Mars lander; conducts biology experiments searching for life.',
    descriptionZh: '首个成功的火星着陆器；进行寻找生命的生物实验。',
    category: 'mars',
    country: 'USA',
  },
  {
    date: '1975-07',
    title: 'Apollo-Soyuz Test Project',
    titleZh: '阿波罗-联盟测试计划',
    description: 'First international crewed space mission — US and USSR spacecraft dock in orbit.',
    descriptionZh: '首次国际载人航天任务——美苏飞船在轨交会对接。',
    category: 'crewed',
    country: 'INT',
  },
  {
    date: '1973-05',
    title: 'Skylab',
    titleZh: '天空实验室',
    description: 'America\'s first space station hosts 3 crews over 171 days in orbit.',
    descriptionZh: '美国首个空间站，在轨171天接待了三批宇航员。',
    category: 'station',
    country: 'USA',
  },
  {
    date: '1972-12',
    title: 'Apollo 17',
    titleZh: '阿波罗十七号',
    description: 'Last Apollo Moon landing; Eugene Cernan becomes the last human on the lunar surface.',
    descriptionZh: '最后一次阿波罗登月；尤金·塞尔南成为最后一位踏上月球表面的人类。',
    category: 'lunar',
    country: 'USA',
  },
  {
    date: '1972-04',
    title: 'Apollo 16',
    titleZh: '阿波罗十六号',
    description: 'Penultimate Moon landing explores the Descartes Highlands with the lunar rover.',
    descriptionZh: '倒数第二次登月，在笛卡尔高地使用月球车探索。',
    category: 'lunar',
    country: 'USA',
  },
  {
    date: '1971-07',
    title: 'Apollo 15',
    titleZh: '阿波罗十五号',
    description: 'First mission to use the Lunar Roving Vehicle; collects the "Genesis Rock".',
    descriptionZh: '首次使用月球车；采集到"创世纪岩石"。',
    category: 'lunar',
    country: 'USA',
  },
  {
    date: '1971-04',
    title: 'Salyut 1',
    titleZh: '礼炮一号',
    description: 'The world\'s first space station launched by the USSR.',
    descriptionZh: '苏联发射的世界首个空间站。',
    category: 'station',
    country: 'USSR',
  },
  {
    date: '1971-02',
    title: 'Apollo 14',
    titleZh: '阿波罗十四号',
    description: 'Alan Shepard famously hits two golf balls on the lunar surface.',
    descriptionZh: '艾伦·谢泼德在月球表面打出著名的高尔夫球。',
    category: 'lunar',
    country: 'USA',
  },
  {
    date: '1970-04',
    title: 'Dong Fang Hong 1',
    titleZh: '东方红一号',
    description: 'China\'s first satellite broadcasts "The East Is Red" from orbit — a space power is born.',
    descriptionZh: '中国首颗卫星在轨道上播放《东方红》乐曲——一个航天强国由此诞生。',
    category: 'satellite',
    country: 'CN',
  },

  // ── 1960s ──────────────────────────────────────────────────────────
  {
    date: '1969-11',
    title: 'Apollo 12',
    titleZh: '阿波罗十二号',
    description: 'Second crewed lunar landing, achieving pinpoint accuracy near Surveyor 3.',
    descriptionZh: '第二次载人登月，精确着陆在勘察者三号附近。',
    category: 'lunar',
    country: 'USA',
  },
  {
    date: '1969-07',
    title: 'Apollo 11',
    titleZh: '阿波罗十一号',
    description: 'Neil Armstrong and Buzz Aldrin become the first humans to walk on the Moon.',
    descriptionZh: '尼尔·阿姆斯特朗和巴兹·奥尔德林成为首次踏上月球的人类。',
    category: 'lunar',
    country: 'USA',
  },
  {
    date: '1968-12',
    title: 'Apollo 8',
    titleZh: '阿波罗八号',
    description: 'First crewed mission to orbit the Moon — Earthrise photo transforms perspectives.',
    descriptionZh: '首次环绕月球的载人任务——"地出"照片改变人类认知视角。',
    category: 'lunar',
    country: 'USA',
  },
  {
    date: '1967-04',
    title: 'Soyuz 1',
    titleZh: '联盟一号',
    description: 'Fatal first flight of Soyuz; cosmonaut Vladimir Komarov dies on landing due to parachute failure.',
    descriptionZh: '联盟号首飞悲剧；宇航员弗拉基米尔·科马罗夫因降落伞故障遇难。',
    category: 'crewed',
    country: 'USSR',
  },
  {
    date: '1967-01',
    title: 'Apollo 1 Fire',
    titleZh: '阿波罗一号火灾',
    description: 'A cabin fire during a ground test kills all three Apollo 1 crew members.',
    descriptionZh: '地面测试中座舱起火，三名阿波罗一号宇航员全部遇难。',
    category: 'crewed',
    country: 'USA',
  },
  {
    date: '1966-03',
    title: 'Gemini 8',
    titleZh: '双子星八号',
    description: 'First docking of two spacecraft in orbit, but a stuck thruster nearly ends in disaster.',
    descriptionZh: '首次两艘航天器在轨对接，但推进器故障险些酿成灾难。',
    category: 'crewed',
    country: 'USA',
  },
  {
    date: '1965-03',
    title: 'Voskhod 2',
    titleZh: '上升二号',
    description: 'Alexei Leonov performs the first spacewalk (EVA) in history.',
    descriptionZh: '阿列克谢·列昂诺夫完成人类首次太空行走。',
    category: 'crewed',
    country: 'USSR',
  },
  {
    date: '1963-06',
    title: 'Vostok 6',
    titleZh: '东方六号',
    description: 'Valentina Tereshkova becomes the first woman in space.',
    descriptionZh: '瓦莲京娜·捷列什科娃成为首位进入太空的女性。',
    category: 'crewed',
    country: 'USSR',
  },
  {
    date: '1961-05',
    title: 'Freedom 7',
    titleZh: '自由七号',
    description: 'Alan Shepard becomes the first American in space on a suborbital Mercury flight.',
    descriptionZh: '艾伦·谢泼德成为首位进入太空的美国人，执行亚轨道水星号飞行。',
    category: 'crewed',
    country: 'USA',
  },
  {
    date: '1961-04',
    title: 'Vostok 1',
    titleZh: '东方一号',
    description: 'Yuri Gagarin becomes the first human in space and to orbit the Earth.',
    descriptionZh: '尤里·加加林成为首位进入太空并环绕地球飞行的人类。',
    category: 'crewed',
    country: 'USSR',
  },

  // ── 1950s ──────────────────────────────────────────────────────────
  {
    date: '1959-09',
    title: 'Luna 2',
    titleZh: '月球二号',
    description: 'First human-made object to reach the lunar surface — a deliberate crash landing.',
    descriptionZh: '首个到达月球表面的人造物体——有意撞月。',
    category: 'lunar',
    country: 'USSR',
  },
  {
    date: '1958-10',
    title: 'Pioneer 1',
    titleZh: '先驱者一号',
    description: 'NASA\'s first spacecraft launch — a lunar flyby attempt that falls short but gathers data.',
    descriptionZh: 'NASA首次航天器发射——飞越月球尝试未达目标但收集了数据。',
    category: 'deepspace',
    country: 'USA',
  },
  {
    date: '1958-01',
    title: 'Explorer 1',
    titleZh: '探索者一号',
    description: 'First US satellite discovers the Van Allen radiation belts around Earth.',
    descriptionZh: '美国首颗卫星发现地球周围的范艾伦辐射带。',
    category: 'satellite',
    country: 'USA',
  },
  {
    date: '1957-11',
    title: 'Sputnik 2',
    titleZh: '斯普特尼克二号',
    description: 'Carries Laika the dog — the first living creature to orbit the Earth.',
    descriptionZh: '搭载小狗莱卡——首个绕地球飞行的生物。',
    category: 'satellite',
    country: 'USSR',
  },
  {
    date: '1957-10',
    title: 'Sputnik 1',
    titleZh: '斯普特尼克一号',
    description: 'The first artificial satellite in history — igniting the Space Age.',
    descriptionZh: '人类历史上首颗人造卫星——点燃太空竞赛。',
    category: 'satellite',
    country: 'USSR',
  },
];

// Sort: planned first, then by date descending
const sortedEvents = [...events].sort((a, b) => {
  if (a.planned && !b.planned) return -1;
  if (!a.planned && b.planned) return 1;
  return b.date.localeCompare(a.date);
});

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EventCard({
  event,
  isRight,
  isExpanded,
  onToggle,
  zh,
}: {
  event: SpaceEvent;
  isRight: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  zh: boolean;
}) {
  const cat = categories.find((c) => c.key === event.category);
  const flag = countryFlags[event.country] || '🌐';

  return (
    <div
      className={cn(
        'relative w-full md:w-[calc(50%-2rem)] mb-10',
        'md:ml-0',
        isRight ? 'md:ml-[calc(50%+2rem)]' : 'md:mr-[calc(50%+2rem)]'
      )}
    >
      {/* Card */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-full text-left rounded-xl border bg-space-800 p-5 transition-all duration-300',
          event.planned
            ? 'border-dashed border-cosmic-blue/40 bg-space-800/50'
            : 'border-space-600 hover:border-cosmic-blue/60',
          isExpanded && 'border-cosmic-blue glow-blue'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-star-dim">{event.date}</span>
              <span className="text-sm">{flag}</span>
              {event.planned && (
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-cosmic-blue/30 text-cosmic-blue font-semibold uppercase tracking-wider">
                  Planned
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-star-white">
              {zh ? event.titleZh : event.title}
            </h3>
            <p className="text-sm text-star-dim mt-1.5 line-clamp-2">
              {zh ? event.descriptionZh : event.description}
            </p>
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-space-600 text-sm text-star-dim leading-relaxed">
                {zh ? event.descriptionZh : event.description}
              </div>
            )}
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-star-dim shrink-0 mt-1 transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>
    </div>
  );
}

function DecadeMarker({ label }: { label: string }) {
  return (
    <div className="relative flex items-center justify-center my-12">
      <div className="absolute left-[24px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-space-600" />
      <div className="relative z-10 px-6 py-2 rounded-full border border-space-600 bg-space-800">
        <span className="text-sm font-semibold text-cosmic-blue tracking-widest uppercase">
          {label}
        </span>
      </div>
    </div>
  );
}

function TimelineLine({ index }: { index: number }) {
  return (
    <>
      {/* Vertical line */}
      <div className="absolute left-[23px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-space-600" />

      {/* Dot */}
      <div
        className={cn(
          'absolute left-[20px] md:left-1/2 md:-translate-x-1/2 w-[8px] h-[8px] rounded-full border-2 border-space-800 z-10',
          { 'bg-space-600': index >= 0 }
        )}
        style={{ top: '28px' }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SpaceTimeline() {
  const zh = useTranslations('common')('back') !== 'Back'; // crude locale detect
  const [locale, setLocale] = useState<'en' | 'zh'>('en');
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Detect locale via a simple check on mount
  useEffect(() => {
    const isZh = typeof document !== 'undefined' && document.documentElement.lang === 'zh-CN';
    setLocale(isZh ? 'zh' : 'en');
  }, []);

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? sortedEvents
        : sortedEvents.filter((e) => e.category === filter),
    [filter]
  );

  // Intersection observer for scroll reveal
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());

  const setCardRef = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(index, el);
    } else {
      cardRefs.current.delete(index);
    }
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        setVisibleSet((prev) => {
          const next = new Set(prev);
          for (const entry of entries) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (entry.isIntersecting) {
              next.add(idx);
            }
          }
          return next;
        });
      },
      { threshold: 0.15 }
    );

    cardRefs.current.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [filtered]);

  // Group events by decade
  const decades = useMemo(() => {
    const map = new Map<string, SpaceEvent[]>();
    for (const ev of filtered) {
      const year = parseInt(ev.date);
      let decade: string;
      if (ev.planned || isNaN(year)) {
        decade = ev.planned ? 'Future' : 'Upcoming';
      } else {
        decade = formatDecade(year);
      }
      const existing = map.get(decade);
      if (existing) {
        existing.push(ev);
      } else {
        map.set(decade, [ev]);
      }
    }
    return map;
  }, [filtered]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-cosmic-blue mb-2">
          <Clock className="w-6 h-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-star-white">
            {locale === 'zh' ? '航天史时间线' : 'Space History Timeline'}
          </h2>
        </div>
        <p className="text-star-dim max-w-xl mx-auto">
          {locale === 'zh'
            ? '从1957年斯普特尼克一号至今，人类航天史上的关键里程碑'
            : 'Key milestones in space exploration from Sputnik 1 to today'}
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => {
              setFilter(cat.key);
              setExpandedId(null);
            }}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              filter === cat.key
                ? 'border-cosmic-blue bg-cosmic-blue/10 text-cosmic-blue'
                : 'border-space-600 text-star-dim hover:text-star-white hover:border-space-500'
            )}
          >
            {cat.key !== 'all' && (
              <span className={cn('w-2 h-2 rounded-full', cat.color)} />
            )}
            {locale === 'zh' ? cat.labelZh : cat.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Center line (desktop) / Left line (mobile) */}
        <div className="absolute left-[24px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-space-600" />

        {Array.from(decades.entries()).map(([decade, decadeEvents], dIdx) => (
          <div key={decade}>
            <DecadeMarker label={locale === 'zh' && decade === 'Future' ? '计划中' : decade} />

            {decadeEvents.map((event, eIdx) => {
              const globalIndex = dIdx * 1000 + eIdx;
              const isRight = globalIndex % 2 === 1;
              const isExpanded = expandedId === globalIndex;
              const isVisible = visibleSet.has(globalIndex);
              const cat = categories.find((c) => c.key === event.category) || categories[1];

              return (
                <div key={`${event.date}-${event.title}`} className="relative">
                  {/* Dot on timeline */}
                  <div
                    className={cn(
                      'absolute left-[20px] md:left-1/2 md:-translate-x-1/2 w-[14px] h-[14px] rounded-full border-2 border-space-800 z-10 transition-all',
                      cat.color,
                      event.planned && 'ring-2 ring-cosmic-blue/40'
                    )}
                    style={{ top: '24px' }}
                  />

                  {/* Card with animation */}
                  <div
                    ref={(el) => setCardRef(globalIndex, el)}
                    data-index={globalIndex}
                    className={cn(
                      'transition-all duration-700',
                      isVisible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-6'
                    )}
                  >
                    <EventCard
                      event={event}
                      isRight={isRight}
                      isExpanded={isExpanded}
                      onToggle={() =>
                        setExpandedId(isExpanded ? null : globalIndex)
                      }
                      zh={locale === 'zh'}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 text-star-dim text-sm">
          <Clock className="w-4 h-4" />
          {locale === 'zh'
            ? `${filtered.length} 个里程碑事件`
            : `${filtered.length} milestone events`}
        </div>
      </div>
    </div>
  );
}
