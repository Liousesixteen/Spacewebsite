/**
 * Display name mappings for Chinese locale.
 *
 * Translates common LL2 entity names into Chinese for zh-CN display.
 * Falls back to the original English name when no mapping exists.
 */

const ROCKET_NAMES_ZH: Record<string, string> = {
  'Falcon 9': '猎鹰 9 号',
  'Falcon 9 Block 5': '猎鹰 9 号 Block 5',
  'Falcon Heavy': '猎鹰重型',
  'Long March 2D': '长征二号丁',
  'Long March 2C': '长征二号丙',
  'Long March 2F': '长征二号F',
  'Long March 3B': '长征三号乙',
  'Long March 3B/E': '长征三号乙/改',
  'Long March 3C': '长征三号丙',
  'Long March 4B': '长征四号乙',
  'Long March 4C': '长征四号丙',
  'Long March 5': '长征五号',
  'Long March 5B': '长征五号B',
  'Long March 6': '长征六号',
  'Long March 6A': '长征六号甲',
  'Long March 7': '长征七号',
  'Long March 7A': '长征七号甲',
  'Long March 8': '长征八号',
  'Long March 11': '长征十一号',
  'Long March 12': '长征十二号',
  'Ceres-1': '谷神星一号',
  'Hyperbola-1': '双曲线一号',
  'Hyperbola-2': '双曲线二号',
  'Zhuque-2': '朱雀二号',
  'Tianlong-2': '天龙二号',
  'Tianlong-3': '天龙三号',
  'Kinetica 1': '力箭一号',
  'Lijian-1': '力箭一号',
  'Kuaizhou 1A': '快舟一号甲',
  'Kuaizhou 11': '快舟十一号',
  'Smart Dragon 1': '捷龙一号',
  'Jielong-1': '捷龙一号',
  'Jielong-3': '捷龙三号',
  'Gravity-1': '引力一号',
  'Pallas-1': '智神星一号',
  'Soyuz 2.1a': '联盟 2.1a',
  'Soyuz 2.1b': '联盟 2.1b',
  'Ariane 6': '阿丽亚娜 6 号',
  'Vega': '织女星',
  'Vega-C': '织女星 C',
  'H-IIA': 'H-IIA',
  'H3': 'H3',
  'Atlas V': '宇宙神 5 号',
  'Delta IV Heavy': '德尔塔 4 重型',
  'Electron': '电子号',
  'Neutron': '中子号',
  'Vulcan Centaur': '火神半人马座',
  'New Glenn': '新格伦',
  'Starship': '星舰',
  'Proton-M': '质子-M',
  'Angara A5': '安加拉 A5',
  'GSLV Mk III': 'GSLV Mk III',
  'PSLV': 'PSLV',
  'SSLV': 'SSLV',
};

const AGENCY_NAMES_ZH: Record<string, string> = {
  'China Aerospace Science and Technology Corporation': '中国航天科技集团',
  CASC: '中国航天科技集团',
  'China Aerospace Science and Industry Corporation': '中国航天科工集团',
  CASIC: '中国航天科工集团',
  'China National Space Administration': '中国国家航天局',
  CNSA: '中国国家航天局',
  'Galactic Energy': '星河动力',
  'iSpace': '星际荣耀',
  'i-Space': '星际荣耀',
  'LandSpace': '蓝箭航天',
  'Space Pioneer': '天兵科技',
  'OneSpace': '零壹空间',
  'Deep Blue Aerospace': '深蓝航天',
  'Linkspace': '翎客航天',
  'Orienspace': '东方空间',
  'CAS Space': '中科宇航',
  SpaceX: '太空探索技术公司 (SpaceX)',
  'Rocket Lab': '火箭实验室',
  'Blue Origin': '蓝色起源',
  'United Launch Alliance': '联合发射联盟',
  ULA: '联合发射联盟',
  Arianespace: '阿丽亚娜空间',
  Roscosmos: '俄罗斯航天国家集团',
  JAXA: '日本宇宙航空研究开发机构',
  'Japan Aerospace Exploration Agency': '日本宇宙航空研究开发机构',
  ISRO: '印度空间研究组织',
  'Indian Space Research Organization': '印度空间研究组织',
  NASA: '美国国家航空航天局',
  ESA: '欧洲空间局',
  'European Space Agency': '欧洲空间局',
};

const SITE_NAMES_ZH: Record<string, string> = {
  'Jiuquan Satellite Launch Center': '酒泉卫星发射中心',
  'Taiyuan Satellite Launch Center': '太原卫星发射中心',
  'Xichang Satellite Launch Center': '西昌卫星发射中心',
  'Wenchang Space Launch Site': '文昌航天发射场',
  'Wenchang Spacecraft Launch Site': '文昌航天发射场',
  'Wenchang': '文昌航天发射场',
  'Cape Canaveral': '卡纳维拉尔角',
  'Kennedy Space Center': '肯尼迪航天中心',
  'Vandenberg SFB': '范登堡空军基地',
  'Baikonur Cosmodrome': '拜科努尔航天发射场',
  'Plesetsk Cosmodrome': '普列谢茨克航天发射场',
  'Vostochny Cosmodrome': '东方航天发射场',
  'Guiana Space Centre': '圭亚那航天中心',
  'Tanegashima Space Center': '种子岛宇宙中心',
  'Satish Dhawan Space Centre': '萨迪什·达万航天中心',
};

const MISSION_TYPE_ZH: Record<string, string> = {
  'Earth Science': '地球科学',
  'Planetary Science': '行星科学',
  'Space Science': '空间科学',
  'Human Spaceflight': '载人航天',
  'Robotic Exploration': '机器人探测',
  'Technology Demonstration': '技术验证',
  'Communications': '通信',
  'Navigation': '导航',
  'Earth Observation': '地球观测',
  'Reconnaissance': '侦察',
  'Government/Top Secret': '政府/机密',
  'Military': '军事',
  'Test Flight': '试飞',
  'Dedicated Rideshare': '拼车发射',
  Resupply: '补给任务',
  'Space Tourism': '太空旅游',
  'Commercial Satellite': '商业卫星',
};

// Partial match: check if the name contains any known Chinese name
function fuzzyMatch(name: string, map: Record<string, string>): string | null {
  // Exact match first
  if (map[name]) return map[name];

  // Check if any key in map is contained within name
  for (const [key, zhName] of Object.entries(map)) {
    if (name.includes(key)) return zhName;
  }

  // Check if name starts with a known prefix
  for (const [key, zhName] of Object.entries(map)) {
    if (name.startsWith(key)) return zhName;
  }

  return null;
}

export function displayRocketName(name: string, locale: string): string {
  if (locale !== 'zh-CN') return name;
  return fuzzyMatch(name, ROCKET_NAMES_ZH) ?? name;
}

export function displayAgencyName(name: string, locale: string): string {
  if (locale !== 'zh-CN') return name;
  return fuzzyMatch(name, AGENCY_NAMES_ZH) ?? name;
}

export function displaySiteName(name: string, locale: string): string {
  if (locale !== 'zh-CN') return name;
  return fuzzyMatch(name, SITE_NAMES_ZH) ?? name;
}

export function displayMissionType(type: string | null | undefined, locale: string): string {
  if (locale !== 'zh-CN' || !type) return type ?? '';
  return MISSION_TYPE_ZH[type] ?? type;
}
