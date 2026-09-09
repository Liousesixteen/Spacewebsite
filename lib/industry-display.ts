const SEGMENTS_EN: Record<string, { name: string; description: string }> = {
  materials: {
    name: 'Space materials',
    description: 'High-strength, lightweight, and heat-resistant materials used in launch vehicles and spacecraft.',
  },
  electronics: {
    name: 'Space-grade electronics',
    description: 'Radiation-tolerant chips, precision sensors, onboard computers, and other mission-critical electronics.',
  },
  mechanical: {
    name: 'Mechanical components',
    description: 'Valves, bearings, seals, connectors, tanks, and precision parts engineered for extreme conditions.',
  },
  software: {
    name: 'Space software systems',
    description: 'Flight control, simulation, telemetry, ground systems, and onboard data-processing software.',
  },
  'rocket-mfg': {
    name: 'Launch vehicle manufacturing',
    description: 'Vehicle design, propulsion, guidance, structures, integration, and complete launch vehicle assembly.',
  },
  'spacecraft-mfg': {
    name: 'Spacecraft manufacturing',
    description: 'Satellites, station modules, crewed vehicles, cargo craft, and deep-space probes.',
  },
  'ground-equipment': {
    name: 'Ground systems',
    description: 'Mission control, ground terminals, antennas, data centers, and training systems.',
  },
  'launch-services': {
    name: 'Launch services',
    description: 'Mission planning, launch execution, orbital delivery, recovery, and reusable operations.',
  },
  satcom: {
    name: 'Satellite communications',
    description: 'Broadband, mobile connectivity, broadcasting, IoT, and emergency communications.',
  },
  navigation: {
    name: 'Positioning and navigation',
    description: 'GNSS-enabled positioning, timing, precision agriculture, mobility, and location services.',
  },
  'remote-sensing': {
    name: 'Earth observation',
    description: 'Weather, resources, climate, disaster response, mapping, and geospatial intelligence.',
  },
  'science-exploration': {
    name: 'Science and exploration',
    description: 'Space science, deep-space missions, human spaceflight, tourism, and in-space manufacturing.',
  },
};

const COMPANY_NAMES: Record<string, { zh?: string; en?: string }> = {
  '中国航天科技集团': { en: 'China Aerospace Science and Technology Corporation' },
  '中国航天科工集团': { en: 'China Aerospace Science and Industry Corporation' },
  '中科宇航': { en: 'CAS Space' },
  '星河动力': { en: 'Galactic Energy' },
  'China Aerospace Science and Technology Corporation': { zh: '中国航天科技集团' },
  'China Aerospace Science and Industry Corporation': { zh: '中国航天科工集团' },
  Arianespace: { zh: '阿丽亚娜空间' },
  'Blue Origin': { zh: '蓝色起源' },
  Boeing: { zh: '波音' },
  'Rocket Lab': { zh: '火箭实验室' },
  'Relativity Space': { zh: '相对论空间' },
  'Northrop Grumman': { zh: '诺斯罗普·格鲁曼' },
  'Lockheed Martin': { zh: '洛克希德·马丁' },
  'Maxar Technologies': { zh: '麦克萨技术' },
  'Planet Labs': { zh: '行星实验室' },
  'Airbus Defence and Space': { zh: '空中客车防务与航天' },
  'Thales Alenia Space': { zh: '泰雷兹阿莱尼亚宇航' },
  'Sierra Space': { zh: '塞拉航天' },
  'Interstellar Technologies': { zh: '星际科技' },
  'IHI Corporation': { zh: 'IHI 株式会社' },
};

export function displayIndustrySegment(
  segment: { id: string; name: string; description: string },
  locale: string
): { name: string; description: string } {
  if (locale !== 'en') {
    return { name: segment.name, description: segment.description };
  }
  return SEGMENTS_EN[segment.id] ?? {
    name: segment.name,
    description: segment.description,
  };
}

export function displayIndustryCompanyName(name: string, locale: string): string {
  const entry = COMPANY_NAMES[name];
  if (!entry) return name;
  if (locale === 'zh-CN') return entry.zh ?? name;
  if (locale === 'en') return entry.en ?? name;
  return name;
}
