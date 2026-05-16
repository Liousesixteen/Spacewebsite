import { PrismaClient, IndustryLevel, CompanyType, TechnologyMaturity } from '@prisma/client';

const prisma = new PrismaClient();

const industrySegments = [
  { id: 'materials', name: '航天材料', level: IndustryLevel.UPSTREAM, category: '材料', description: '为航天器与火箭提供高强度、轻量化、耐高温的关键材料，是整个产业链的基础环节。', technologies: ['碳纤维复合材料', '钛合金', '高温合金', '隔热材料', '铝锂合金'], marketSize: 280, growthRate: 9.2, challenges: ['超高温耐受', '极端环境可靠性', '量产成本高', '标准化体系'], trends: ['增材制造广泛应用', '复合材料替代传统金属', '材料数字化设计', '回收再利用'] },
  { id: 'electronics', name: '航天电子元器件', level: IndustryLevel.UPSTREAM, category: '电子元器件', description: '抗辐射芯片、高精度传感器、星载计算机等电子核心部件的研发制造。', technologies: ['宇航级芯片', '惯性导航', '星载计算机', '太阳能电池', '高精度传感器'], marketSize: 450, growthRate: 11.5, challenges: ['抗辐射性能', '小型化', '高可靠性', '国产替代'], trends: ['SoC化集成', '商业元器件上星', '低成本化', 'AI芯片应用'] },
  { id: 'mechanical', name: '航天机械部件', level: IndustryLevel.UPSTREAM, category: '机械部件', description: '阀门、轴承、密封件、连接器、储箱等机械零部件，决定航天产品的可靠性。', technologies: ['精密阀门', '高速轴承', '低温密封件', '高压连接器', '复合储箱'], marketSize: 180, growthRate: 7.8, challenges: ['极端工况可靠性', '精密加工', '批量一致性', '国产化'], trends: ['增材制造一体成型', '智能化检测', '模块化设计'] },
  { id: 'software', name: '航天软件系统', level: IndustryLevel.UPSTREAM, category: '软件系统', description: '飞控、仿真、测控、地面系统、数据处理等软件系统。', technologies: ['飞控软件', '仿真系统', '测控软件', '地面系统', '在轨数据处理'], marketSize: 320, growthRate: 14.0, challenges: ['实时性要求高', '安全可信', '验证难度大', 'AI应用'], trends: ['软件定义卫星', '云原生架构', 'AI/ML上星', '开源生态'] },
  { id: 'rocket-mfg', name: '运载火箭制造', level: IndustryLevel.MIDSTREAM, category: '制造', description: '火箭整箭设计、动力系统、控制系统等总装制造。', technologies: ['液氧甲烷发动机', '可回收技术', '复合材料箭体', '电气化控制', '大推力发动机'], marketSize: 800, growthRate: 13.5, challenges: ['可重复使用经济性', '高可靠发动机', '快速制造周期', '国际竞争激烈'], trends: ['可回收复用', '商业化', '低成本化', '大型化'] },
  { id: 'spacecraft-mfg', name: '航天器制造', level: IndustryLevel.MIDSTREAM, category: '制造', description: '卫星、空间站舱段、载人飞船、深空探测器等航天器的研制总装。', technologies: ['卫星平台', '舱段集成', '载人飞船', '货运飞船', '深空探测器'], marketSize: 1100, growthRate: 12.8, challenges: ['批量化生产', '高可靠性', '快速响应', '在轨服务'], trends: ['标准化平台', '模块化设计', '低轨星座', '商业空间站'] },
  { id: 'ground-equipment', name: '地面设备', level: IndustryLevel.MIDSTREAM, category: '设备', description: '测控站、地面终端、数据中心、天线系统、训练模拟器等地面基础设施。', technologies: ['测控天线', '相控阵', '数据中心', '低成本终端', '训练模拟器'], marketSize: 380, growthRate: 10.2, challenges: ['全球覆盖', '终端低成本化', '高带宽', '一体化'], trends: ['软件定义地面站', '云化运营', '终端小型化'] },
  { id: 'launch-services', name: '发射服务', level: IndustryLevel.MIDSTREAM, category: '服务', description: '从发射任务执行、在轨交付到回收复用的全流程发射服务。', technologies: ['发射场运营', '一箭多星', '在轨交付', '轨道转移', '回收复用'], marketSize: 250, growthRate: 18.6, challenges: ['发射工位资源', '快速周转', '价格竞争', '保险'], trends: ['专车专线', '共享拼车', '海上发射', '轨道运输服务'] },
  { id: 'satcom', name: '卫星通信', level: IndustryLevel.DOWNSTREAM, category: '服务', description: '宽带互联网、移动通信、广播电视、物联网、应急通信等通信应用。', technologies: ['Ku/Ka频段', '激光星间链路', '低轨星座', 'IoT 直连', 'NTN 5G'], marketSize: 1850, growthRate: 16.5, challenges: ['频谱协调', '终端成本', '互操作性', '太空交通'], trends: ['手机直连卫星', '天地一体网络', '万星级星座', 'AI赋能'] },
  { id: 'navigation', name: '导航定位', level: IndustryLevel.DOWNSTREAM, category: '服务', description: 'GPS/北斗/伽利略/格洛纳斯等全球导航系统支持的定位、授时、精准农业、智慧交通等服务。', technologies: ['BDS/GPS/GLONASS', '高精度PPP', '室内外融合', '自动驾驶定位', '授时服务'], marketSize: 1500, growthRate: 8.8, challenges: ['高精度', '抗干扰', '低功耗', '城市峡谷信号'], trends: ['多频多模融合', '北斗短报文', '低轨增强', '智能终端'] },
  { id: 'remote-sensing', name: '遥感观测', level: IndustryLevel.DOWNSTREAM, category: '服务', description: '气象、资源、环境、灾害预警、城市规划等遥感与对地观测应用。', technologies: ['高分辨率成像', 'SAR雷达', '高光谱', 'AI影像分析', '近实时下传'], marketSize: 720, growthRate: 12.2, challenges: ['数据时效性', '云遮挡', '价格', '解译能力'], trends: ['星座化', '商业遥感', 'AI智能分析', '订阅制服务'] },
  { id: 'science-exploration', name: '科学探索', level: IndustryLevel.DOWNSTREAM, category: '服务', description: '空间科学、深空探测、载人航天、太空旅游、在轨制造等前沿探索活动。', technologies: ['深空探测', '载人月球', '太空旅游', '在轨制造', '行星际通信'], marketSize: 480, growthRate: 19.0, challenges: ['长周期高投入', '技术风险', '国际合作', '商业模式'], trends: ['商业月球', '火星探测', '在轨服务', '小行星采矿'] },
];

const companies = [
  { id: 'spacex', name: 'SpaceX', country: 'USA', type: CompanyType.PRIVATE, foundedYear: 2002, headquarters: 'Hawthorne, California, USA', employees: 13000, revenue: 320, products: ['Falcon 9', 'Falcon Heavy', 'Starship', 'Dragon', 'Starlink'], achievements: ['首次实现火箭一级回收', '首次商业载人飞行', '部署最大低轨星座 Starlink', 'Falcon 9 累计发射数百次'], website: 'https://www.spacex.com', description: 'Space Exploration Technologies Corp.，由 Elon Musk 创立，致力于降低太空运输成本、火星殖民。Falcon 9 与 Starship 重塑全球商业航天格局。' },
  { id: 'blue-origin', name: 'Blue Origin', country: 'USA', type: CompanyType.PRIVATE, foundedYear: 2000, headquarters: 'Kent, Washington, USA', employees: 11000, products: ['New Shepard', 'New Glenn', 'BE-4 发动机', 'Blue Moon 着陆器'], achievements: ['亚轨道太空旅游', 'BE-4 发动机为 Vulcan/New Glenn 提供动力', 'Blue Moon NASA 月球着陆器合同'], website: 'https://www.blueorigin.com', description: '由 Jeff Bezos 创立，专注亚轨道与轨道发射、月球着陆器与可重复使用运载器。' },
  { id: 'boeing', name: 'Boeing', country: 'USA', type: CompanyType.PUBLIC, foundedYear: 1916, headquarters: 'Arlington, Virginia, USA', employees: 156000, revenue: 770, products: ['SLS Core Stage', 'Starliner CST-100', 'X-37B', '商用卫星平台'], achievements: ['Apollo 计划重要承包商', '航天飞机主承包商', 'ISS 主承包商', 'SLS 重型火箭核心级'], website: 'https://www.boeing.com', stockCode: 'BA', description: '波音公司航空航天与防务巨头，承担 SLS、Starliner、ISS 等重要项目。' },
  { id: 'lockheed-martin', name: 'Lockheed Martin', country: 'USA', type: CompanyType.PUBLIC, foundedYear: 1995, headquarters: 'Bethesda, Maryland, USA', employees: 122000, revenue: 670, products: ['Orion 飞船', 'Atlas V', 'GPS-III', 'JWST 主结构'], achievements: ['Orion 月球飞船主承包商', 'JWST 望远镜核心承包商', '行星探测器多次任务'], website: 'https://www.lockheedmartin.com', stockCode: 'LMT', description: '洛克希德马丁，全球最大国防与航天承包商，深度参与月球、火星与深空任务。' },
  { id: 'northrop-grumman', name: 'Northrop Grumman', country: 'USA', type: CompanyType.PUBLIC, foundedYear: 1939, headquarters: 'Falls Church, Virginia, USA', employees: 101000, revenue: 410, products: ['Cygnus 货运飞船', 'Antares 火箭', 'JWST 集成', '军事卫星'], achievements: ['JWST 主承包商', 'Cygnus 多次为 ISS 补给', '哈勃望远镜服务任务'], website: 'https://www.northropgrumman.com', stockCode: 'NOC', description: '诺斯罗普·格鲁曼，专注国防、航天与航空系统，JWST 集成商。' },
  { id: 'rocket-lab', name: 'Rocket Lab', country: 'USA', type: CompanyType.PUBLIC, foundedYear: 2006, headquarters: 'Long Beach, California, USA', employees: 1900, revenue: 4.5, products: ['Electron 火箭', 'Photon 卫星平台', 'Neutron 火箭'], achievements: ['Electron 首发', '小卫星发射数量第二', 'Neutron 中型火箭研发'], website: 'https://www.rocketlabusa.com', stockCode: 'RKLB', description: '专注小卫星发射的商业航天公司，Electron 已稳定运行，Neutron 研发中。' },
  { id: 'sierra-space', name: 'Sierra Space', country: 'USA', type: CompanyType.STARTUP, foundedYear: 2021, headquarters: 'Louisville, Colorado, USA', products: ['Dream Chaser 航天飞机', 'LIFE 充气式空间站舱'], achievements: ['Dream Chaser NASA CRS-2 合同', '与 Blue Origin 合作 Orbital Reef 商业空间站'], website: 'https://www.sierraspace.com', description: '从 Sierra Nevada 拆分，专注 Dream Chaser 升力体航天飞机与商业空间站。' },
  { id: 'maxar', name: 'Maxar Technologies', country: 'USA', type: CompanyType.PRIVATE, foundedYear: 2017, headquarters: 'Westminster, Colorado, USA', employees: 4400, products: ['WorldView 卫星', 'SSL 卫星平台', '高分辨率影像'], achievements: ['全球高分辨率商业遥感龙头', 'SSL 平台广泛应用'], website: 'https://www.maxar.com', description: '高分辨率商业遥感与卫星平台供应商。' },
  { id: 'planet-labs', name: 'Planet Labs', country: 'USA', type: CompanyType.PUBLIC, foundedYear: 2010, headquarters: 'San Francisco, California, USA', employees: 1000, products: ['Dove 卫星', 'SkySat 卫星', '日级全球影像'], achievements: ['首个实现日级全球地表覆盖', '在轨卫星数量超过 200 颗'], website: 'https://www.planet.com', stockCode: 'PL', description: 'Planet Labs 通过 Dove 立方星星座实现每日地表全覆盖，是商业遥感代表企业。' },
  { id: 'relativity-space', name: 'Relativity Space', country: 'USA', type: CompanyType.STARTUP, foundedYear: 2015, headquarters: 'Long Beach, California, USA', products: ['Terran 1', 'Terran R', '3D 打印火箭'], achievements: ['首枚 3D 打印火箭 Terran 1 发射', '大型金属增材制造突破'], website: 'https://www.relativityspace.com', description: '通过大型 3D 打印技术革新火箭制造，研发可回收 Terran R。' },
  { id: 'casc', name: '中国航天科技集团', country: 'China', type: CompanyType.STATE_OWNED, foundedYear: 1956, headquarters: '北京', employees: 174000, revenue: 410, products: ['长征系列火箭', '神舟飞船', '北斗导航卫星', '嫦娥探测器', '天问火星探测器'], achievements: ['长征火箭累计 500+ 次发射', '完成载人航天三步走', '建成北斗全球系统', '完成月背软着陆与采样返回'], website: 'http://www.spacechina.com', description: 'CASC，中国航天工业核心企业，承担载人航天、北斗、探月、火星等重大工程。' },
  { id: 'casic', name: '中国航天科工集团', country: 'China', type: CompanyType.STATE_OWNED, foundedYear: 1999, headquarters: '北京', employees: 150000, revenue: 280, products: ['快舟系列火箭', '虹云卫星', '行云物联网卫星'], achievements: ['快舟系列商业固体火箭', '行云物联网星座'], website: 'http://www.casic.com.cn', description: 'CASIC，专注国防航天与商业航天，运营快舟火箭与行云星座。' },
  { id: 'landspace', name: '蓝箭航天', country: 'China', type: CompanyType.PRIVATE, foundedYear: 2015, headquarters: '北京', products: ['朱雀二号 (液氧甲烷)', '朱雀三号 (可回收)', '天鹊发动机'], achievements: ['全球首枚液氧甲烷火箭朱雀二号入轨', '可回收火箭工程演示'], website: 'https://www.landspace.com', description: '中国头部商业航天公司，专注液氧甲烷发动机与可回收火箭。' },
  { id: 'galactic-energy', name: '星河动力', country: 'China', type: CompanyType.PRIVATE, foundedYear: 2018, headquarters: '北京', products: ['谷神星一号', '智神星一号 (液体)'], achievements: ['谷神星一号多次商业发射成功', '小卫星专车服务'], website: 'http://www.galactic-energy.cn', description: '专注小卫星商业发射的民营航天公司。' },
  { id: 'cas-space', name: '中科宇航', country: 'China', type: CompanyType.STARTUP, foundedYear: 2018, headquarters: '广州', products: ['力箭一号', '力箭二号 (研发中)'], achievements: ['力箭一号首飞成功', '中国民营固体大火箭'], website: 'http://www.cas-space.com', description: '中科院孵化的商业航天公司，专注力箭系列固体与液体火箭。' },
  { id: 'roscosmos', name: 'Roscosmos', country: 'Russia', type: CompanyType.STATE_OWNED, foundedYear: 1992, headquarters: 'Moscow, Russia', employees: 170000, products: ['Soyuz 系列', 'Proton-M', 'Angara', 'Progress 飞船'], achievements: ['人类首次太空飞行', '首座空间站 Salyut/Mir', 'Soyuz 累计发射超 2000 次'], website: 'https://www.roscosmos.ru', description: '俄罗斯联邦航天局，运营拜科努尔与普列谢茨克发射场。' },
  { id: 'rsc-energia', name: 'RSC Energia', country: 'Russia', type: CompanyType.STATE_OWNED, foundedYear: 1946, headquarters: 'Korolyov, Russia', products: ['Soyuz 飞船', 'Progress 货运飞船', 'ISS 俄罗斯舱段'], achievements: ['Soyuz 飞船持续运营', 'Mir 空间站设计', 'ISS 服务舱'], website: 'https://www.energia.ru', description: '设计制造 Soyuz 飞船与空间站舱段的核心企业。' },
  { id: 'airbus-ds', name: 'Airbus Defence and Space', country: 'Europe', type: CompanyType.PUBLIC, foundedYear: 2014, headquarters: 'Toulouse, France', employees: 39000, revenue: 130, products: ['Eurostar 卫星平台', 'Galileo 卫星', 'BepiColombo 探测器'], achievements: ['Galileo 系统主承包商', 'JUICE 木星探测器', 'Ariane 6 关键贡献'], website: 'https://www.airbus.com/en/space', stockCode: 'AIR.PA', description: '空客防务与航天，欧洲航天工业核心企业。' },
  { id: 'arianespace', name: 'Arianespace', country: 'Europe', type: CompanyType.PRIVATE, foundedYear: 1980, headquarters: 'Évry-Courcouronnes, France', products: ['Ariane 5', 'Ariane 6', 'Vega C'], achievements: ['首家商业发射服务公司', '运营库鲁发射场'], website: 'https://www.arianespace.com', description: '欧洲商业发射服务运营商，运营 Ariane 与 Vega 系列火箭。' },
  { id: 'thales-alenia', name: 'Thales Alenia Space', country: 'Europe', type: CompanyType.PRIVATE, foundedYear: 2007, headquarters: 'Cannes, France', employees: 8500, products: ['Spacebus 平台', 'ISS Cygnus 舱', 'ExoMars'], achievements: ['ISS 居住舱与货运舱段', '欧洲商业卫星平台'], website: 'https://www.thalesaleniaspace.com', description: '法意合资航天公司，专注通信卫星与载人航天舱段。' },
  { id: 'ohb', name: 'OHB SE', country: 'Europe', type: CompanyType.PUBLIC, foundedYear: 1981, headquarters: 'Bremen, Germany', employees: 3100, products: ['Galileo 卫星', '小卫星平台', '空间科学任务'], achievements: ['Galileo 卫星制造', 'PLATO 系外行星任务'], website: 'https://www.ohb.de', stockCode: 'OHB.DE', description: '德国上市航天公司，参与 Galileo 与 ESA 多项任务。' },
  { id: 'mhi', name: '三菱重工', country: 'Japan', type: CompanyType.PUBLIC, foundedYear: 1884, headquarters: 'Tokyo, Japan', employees: 78000, products: ['H-IIA', 'H3 火箭', 'LE-9 发动机'], achievements: ['H-IIA 高成功率发射', 'H3 新一代火箭研制', '日本火箭主承包商'], website: 'https://www.mhi.com', stockCode: '7011.T', description: '三菱重工业，日本航天工业龙头，承担 H 系列火箭研制。' },
  { id: 'ihi', name: 'IHI Corporation', country: 'Japan', type: CompanyType.PUBLIC, foundedYear: 1853, headquarters: 'Tokyo, Japan', employees: 28000, products: ['H3 二级发动机 LE-5B', 'Epsilon 固体发动机', '航天器组件'], achievements: ['日本航天发动机供应商'], website: 'https://www.ihi.co.jp', stockCode: '7013.T', description: 'IHI 株式会社，日本火箭发动机与航天器组件供应商。' },
  { id: 'interstellar-tech', name: 'Interstellar Technologies', country: 'Japan', type: CompanyType.STARTUP, foundedYear: 2013, headquarters: 'Hokkaido, Japan', products: ['MOMO 探空火箭', 'ZERO 小型火箭'], achievements: ['日本首家民营火箭入太空', 'ZERO 小型轨道火箭研发'], website: 'https://www.istellartech.com', description: '日本民营商业火箭公司，从探空火箭起步。' },
  { id: 'isro', name: 'ISRO', country: 'India', type: CompanyType.STATE_OWNED, foundedYear: 1969, headquarters: 'Bengaluru, India', employees: 17000, products: ['PSLV', 'GSLV', 'Chandrayaan', 'Mangalyaan'], achievements: ['Chandrayaan-3 月球南极软着陆', '一箭 104 星纪录', 'Mangalyaan 火星首战告捷'], website: 'https://www.isro.gov.in', description: '印度空间研究组织，亚洲重要航天力量，月球与火星探测达世界先进水平。' },
  { id: 'skyroot', name: 'Skyroot Aerospace', country: 'India', type: CompanyType.STARTUP, foundedYear: 2018, headquarters: 'Hyderabad, India', products: ['Vikram-S', 'Vikram-1', 'Vikram-2'], achievements: ['印度首家民营运载火箭企业', 'Vikram-S 探空火箭首飞'], website: 'https://skyroot.in', description: '印度领先的商业航天初创公司，专注 Vikram 系列火箭。' },
];

const companySegmentLinks = [
  { companyId: 'spacex', segmentId: 'rocket-mfg' }, { companyId: 'spacex', segmentId: 'spacecraft-mfg' }, { companyId: 'spacex', segmentId: 'launch-services' }, { companyId: 'spacex', segmentId: 'satcom' },
  { companyId: 'blue-origin', segmentId: 'rocket-mfg' }, { companyId: 'blue-origin', segmentId: 'launch-services' },
  { companyId: 'boeing', segmentId: 'rocket-mfg' }, { companyId: 'boeing', segmentId: 'spacecraft-mfg' },
  { companyId: 'lockheed-martin', segmentId: 'spacecraft-mfg' }, { companyId: 'lockheed-martin', segmentId: 'science-exploration' },
  { companyId: 'northrop-grumman', segmentId: 'spacecraft-mfg' }, { companyId: 'northrop-grumman', segmentId: 'launch-services' },
  { companyId: 'rocket-lab', segmentId: 'rocket-mfg' }, { companyId: 'rocket-lab', segmentId: 'launch-services' }, { companyId: 'rocket-lab', segmentId: 'spacecraft-mfg' },
  { companyId: 'sierra-space', segmentId: 'spacecraft-mfg' }, { companyId: 'sierra-space', segmentId: 'science-exploration' },
  { companyId: 'maxar', segmentId: 'spacecraft-mfg' }, { companyId: 'maxar', segmentId: 'remote-sensing' },
  { companyId: 'planet-labs', segmentId: 'remote-sensing' }, { companyId: 'planet-labs', segmentId: 'spacecraft-mfg' },
  { companyId: 'relativity-space', segmentId: 'rocket-mfg' }, { companyId: 'relativity-space', segmentId: 'launch-services' },
  { companyId: 'casc', segmentId: 'rocket-mfg' }, { companyId: 'casc', segmentId: 'spacecraft-mfg' }, { companyId: 'casc', segmentId: 'satcom' }, { companyId: 'casc', segmentId: 'science-exploration' },
  { companyId: 'casic', segmentId: 'rocket-mfg' }, { companyId: 'casic', segmentId: 'satcom' },
  { companyId: 'landspace', segmentId: 'rocket-mfg' }, { companyId: 'landspace', segmentId: 'launch-services' },
  { companyId: 'galactic-energy', segmentId: 'rocket-mfg' }, { companyId: 'galactic-energy', segmentId: 'launch-services' },
  { companyId: 'cas-space', segmentId: 'rocket-mfg' }, { companyId: 'cas-space', segmentId: 'launch-services' },
  { companyId: 'roscosmos', segmentId: 'rocket-mfg' }, { companyId: 'roscosmos', segmentId: 'spacecraft-mfg' }, { companyId: 'roscosmos', segmentId: 'launch-services' },
  { companyId: 'rsc-energia', segmentId: 'spacecraft-mfg' },
  { companyId: 'airbus-ds', segmentId: 'spacecraft-mfg' }, { companyId: 'airbus-ds', segmentId: 'navigation' }, { companyId: 'airbus-ds', segmentId: 'science-exploration' },
  { companyId: 'arianespace', segmentId: 'launch-services' }, { companyId: 'arianespace', segmentId: 'rocket-mfg' },
  { companyId: 'thales-alenia', segmentId: 'spacecraft-mfg' }, { companyId: 'thales-alenia', segmentId: 'satcom' },
  { companyId: 'ohb', segmentId: 'spacecraft-mfg' }, { companyId: 'ohb', segmentId: 'navigation' },
  { companyId: 'mhi', segmentId: 'rocket-mfg' }, { companyId: 'mhi', segmentId: 'launch-services' },
  { companyId: 'ihi', segmentId: 'rocket-mfg' }, { companyId: 'ihi', segmentId: 'mechanical' },
  { companyId: 'interstellar-tech', segmentId: 'rocket-mfg' },
  { companyId: 'isro', segmentId: 'rocket-mfg' }, { companyId: 'isro', segmentId: 'spacecraft-mfg' }, { companyId: 'isro', segmentId: 'launch-services' }, { companyId: 'isro', segmentId: 'remote-sensing' },
  { companyId: 'skyroot', segmentId: 'rocket-mfg' },
];

const technologies = [
  { id: 'reusable-rocket', name: '火箭可回收技术', category: '推进', maturityLevel: TechnologyMaturity.MATURE, description: '通过推力矢量控制、栅格舵气动控制、着陆腿等技术实现火箭一级垂直着陆回收并重复使用，大幅降低发射成本。', applications: ['商业卫星发射', '载人航天', '货运补给', '深空探测'], keyPlayers: ['SpaceX', 'Blue Origin', '蓝箭航天', 'Rocket Lab'], challenges: ['多次复用可靠性', '回收着陆精度', '发动机寿命'], breakthroughs: [{date: '2015-12-21', content: 'SpaceX Falcon 9 一级首次陆地着陆成功'}, {date: '2017-03-30', content: 'SpaceX 首次实现一级火箭复飞'}, {date: '2024-10-13', content: 'Starship Super Heavy 首次发射台筷子夹回收'}] },
  { id: 'methalox-engine', name: '液氧甲烷发动机', category: '推进', maturityLevel: TechnologyMaturity.APPLIED, description: '使用液态甲烷与液氧作为推进剂的火箭发动机，相比液氢/煤油综合性能优秀，具备良好的可重复使用与火星原位制取潜力。', applications: ['Starship Raptor', '蓝箭天鹊', 'Vulcan BE-4', 'New Glenn'], keyPlayers: ['SpaceX', 'Blue Origin', '蓝箭航天', 'ULA'], challenges: ['推力室冷却', '甲烷富燃循环', '极低温处理'], breakthroughs: [{date: '2019-07-25', content: 'SpaceX Raptor 全流量分级燃烧首次试车'}, {date: '2023-07-12', content: '蓝箭朱雀二号成为全球首枚液氧甲烷入轨火箭'}] },
  { id: 'ion-propulsion', name: '离子推进', category: '推进', maturityLevel: TechnologyMaturity.APPLIED, description: '通过电离推进剂并加速喷射产生推力，比冲极高（3000-10000 秒），适合长期在轨机动与深空任务。', applications: ['卫星位置保持', '深空探测', '小行星探测', '通信卫星轨道转移'], keyPlayers: ['NASA', 'ESA', 'CASC', 'Aerojet Rocketdyne'], challenges: ['推力小', '电源功率限制', '工作寿命'], breakthroughs: [{date: '1998-10-24', content: 'Deep Space 1 首次使用离子推进进行深空航行'}, {date: '2014-05-09', content: '北斗导航卫星首次部署电推进系统'}] },
  { id: 'nuclear-thermal', name: '核热推进', category: '推进', maturityLevel: TechnologyMaturity.EXPERIMENTAL, description: '利用核反应堆加热推进剂产生推力，比冲约为化学推进的 2 倍，可显著缩短深空任务时间。', applications: ['载人火星任务', '深空探测', '快速行星际转移'], keyPlayers: ['DARPA', 'NASA', 'BWX Technologies'], challenges: ['核安全', '反应堆小型化', '空间法规'], breakthroughs: [{date: '2023-01-24', content: 'DARPA DRACO 核热推进项目启动'}] },
  { id: 'additive-mfg', name: '增材制造/3D打印', category: '制造', maturityLevel: TechnologyMaturity.APPLIED, description: '通过逐层堆积金属或复合材料制造复杂航天器零部件，缩短研制周期、降低成本，适合发动机喷注器、燃烧室等复杂结构。', applications: ['火箭发动机', '复杂支架结构', '一体化卫星部件', '推力室'], keyPlayers: ['SpaceX', 'Rocket Lab', 'Relativity Space', 'GE Aerospace'], challenges: ['批次一致性', '材料认证', '后处理工艺'], breakthroughs: [{date: '2014-08-04', content: 'SpaceX SuperDraco 发动机首次 3D 打印'}, {date: '2023-03-22', content: 'Relativity Terran 1 首枚 3D 打印火箭飞行'}] },
  { id: 'satellite-internet', name: '卫星互联网', category: '通信', maturityLevel: TechnologyMaturity.APPLIED, description: '通过低地球轨道大规模卫星星座提供全球宽带互联网服务，支持手机直连、高速接入、应急通信等应用。', applications: ['偏远地区接入', '海事通信', '航空 WiFi', '应急救援', '军事通信'], keyPlayers: ['Starlink (SpaceX)', '千帆星座', 'Amazon Kuiper', 'OneWeb', '吉利时空道宇'], challenges: ['频谱协调', '空间碎片', '终端成本', '光通信链路'], breakthroughs: [{date: '2019-05-23', content: 'Starlink 首批 60 颗卫星发射'}, {date: '2024-08-06', content: '千帆星座首批卫星部署'}] },
  { id: 'quantum-comm', name: '量子通信', category: '通信', maturityLevel: TechnologyMaturity.EXPERIMENTAL, description: '基于量子密钥分发 (QKD) 与量子纠缠的安全通信技术，理论上无法被窃听，可用于政府、金融、军事高安全通信。', applications: ['政府机密通信', '金融数据传输', '量子互联网骨干'], keyPlayers: ['中国科学技术大学', '墨子号团队', 'NIST', 'NASA'], challenges: ['长距离损耗', '中继器研制', '密钥率'], breakthroughs: [{date: '2016-08-16', content: '中国发射全球首颗量子科学实验卫星墨子号'}, {date: '2017-09-29', content: '墨子号实现 7600 公里洲际量子密钥分发'}] },
  { id: 'deep-space-comm', name: '深空通信', category: '通信', maturityLevel: TechnologyMaturity.MATURE, description: '面向月球、火星与外太阳系的高功率、高灵敏度通信系统，使用大型天线阵列与窄波束技术。', applications: ['Voyager 任务', '火星探测器', '月球任务', '小行星探测'], keyPlayers: ['NASA Deep Space Network', 'ESA ESTRACK', '中国深空测控网'], challenges: ['信号衰减', '深空时延', '功率限制'], breakthroughs: [{date: '1977-09-05', content: 'Voyager 1 发射，至今仍持续传回深空数据'}, {date: '2023-12-11', content: 'NASA DSOC 月球距离激光通信演示成功'}] },
  { id: 'space-robotics', name: '太空机械臂', category: '机器人', maturityLevel: TechnologyMaturity.APPLIED, description: '空间站舱外操作、卫星捕获、设备维护等用途的太空机械臂技术。', applications: ['ISS 加拿大臂', '天宫空间站机械臂', '卫星在轨服务', '空间装配'], keyPlayers: ['MDA (Canadarm)', '航天科技五院', 'JAXA', 'NASA'], challenges: ['精密控制', '空间环境适应', '人机协作'], breakthroughs: [{date: '1981-04-12', content: 'STS-1 航天飞机首装加拿大臂'}, {date: '2021-04-29', content: '中国空间站天和核心舱机械臂入轨'}] },
  { id: 'auto-docking', name: '自主交会对接', category: '导航', maturityLevel: TechnologyMaturity.APPLIED, description: '飞船自主接近并对接目标航天器的关键技术，包括光学/激光/微波多模导航、相对运动控制等。', applications: ['ISS 货运飞船', '神舟/天舟对接', 'Crew Dragon', 'Cygnus'], keyPlayers: ['SpaceX', 'CASC', 'Roscosmos', 'NASA'], challenges: ['极高安全裕度', '多模冗余', '近距离操控'], breakthroughs: [{date: '2011-11-03', content: '神舟八号与天宫一号首次自动交会对接'}, {date: '2019-03-03', content: 'Crew Dragon 首次商业自主对接 ISS'}] },
  { id: 'solar-sail', name: '太阳帆', category: '推进', maturityLevel: TechnologyMaturity.EXPERIMENTAL, description: '利用太阳光子动量产生推力的无推进剂推进技术，适合长周期、低质量深空任务。', applications: ['深空探测', '小行星观测', '太阳极区任务'], keyPlayers: ['NASA', 'JAXA', 'The Planetary Society'], challenges: ['薄膜材料', '展开机构', '姿态控制'], breakthroughs: [{date: '2010-05-21', content: 'JAXA IKAROS 首次太阳帆星际航行'}, {date: '2024-04-23', content: 'NASA ACS3 太阳帆首次部署'}] },
  { id: 'orbital-mfg', name: '在轨制造', category: '制造', maturityLevel: TechnologyMaturity.RESEARCH, description: '在微重力环境下制造特殊药品、光纤、半导体材料等，利用空间环境优势生产地面无法实现的产品。', applications: ['ZBLAN 光纤', '蛋白质晶体', '半导体材料', '高纯度药物'], keyPlayers: ['Varda Space', 'Sierra Space', 'Redwire'], challenges: ['返回成本', '工艺验证', '商业模式'], breakthroughs: [{date: '2024-02-21', content: 'Varda W-Series 1 首颗在轨制药卫星返回成功'}] },
  { id: 'lunar-mining', name: '月球采矿', category: '资源', maturityLevel: TechnologyMaturity.RESEARCH, description: '从月球表面采集水冰、稀土、氦-3 等资源，支持月球基地与深空任务原位资源利用 (ISRU)。', applications: ['月球基地补给', '推进剂原位制取', '稀有金属返回'], keyPlayers: ['NASA', 'CNSA', 'ESA', 'iSpace', 'Astrobotic'], challenges: ['法律框架', '采集设备', '能源供应'], breakthroughs: [{date: '2020-12-17', content: '嫦娥五号月球采样返回 1.7 公斤'}, {date: '2024-06-25', content: '嫦娥六号月背采样返回'}] },
  { id: 'space-elevator', name: '太空电梯', category: '运输', maturityLevel: TechnologyMaturity.RESEARCH, description: '从地面延伸至地球同步轨道的缆绳，利用电梯舱实现低成本、可重复的天地往返。仍处于材料与工程概念阶段。', applications: ['货运入轨', '太空旅游', '行星际转运'], keyPlayers: ['Obayashi (大林组)', 'NASA 概念研究', 'ISEC'], challenges: ['超高强度纤维材料', '空间碎片碰撞', '工程可行性'], breakthroughs: [{date: '2018-09-11', content: '日本静冈大学 STARS-Me 立方星首次轨道电梯实验'}] },
  { id: 'hypersonic', name: '高超音速推进', category: '推进', maturityLevel: TechnologyMaturity.EXPERIMENTAL, description: '马赫 5 以上飞行器的吸气式发动机技术（如超燃冲压），可用于天地运输与下一代飞行器。', applications: ['可重复使用空天飞机', '高速侦察', '点对点运输'], keyPlayers: ['Boeing', 'Hermeus', '中国航天三院', 'DARPA'], challenges: ['热防护', '燃烧室稳定', '材料寿命'], breakthroughs: [{date: '2013-05-01', content: 'X-51A 超燃冲压持续飞行 240 秒'}] },
];

const materials = [
  { id: 'cf-t800', name: 'T800 碳纤维', category: '复合材料', properties: {密度: '1.81 g/cm³', 抗拉强度: '5.49 GPa', 弹性模量: '294 GPa', 工作温度: '-150~150 °C', 应变: '1.9%'}, applications: ['火箭整流罩', '卫星结构', '飞船外壳', '复合压力容器'], manufacturers: ['东丽', '中复神鹰', '光威复材', 'Hexcel'], description: '高强度高模量碳纤维，是航天器主承力结构与压力容器的关键材料。' },
  { id: 'cf-t1000', name: 'T1000 碳纤维', category: '复合材料', properties: {密度: '1.80 g/cm³', 抗拉强度: '6.37 GPa', 弹性模量: '294 GPa', 工作温度: '-150~150 °C', 应变: '2.2%'}, applications: ['深空探测器', '重型火箭气瓶', '高性能复合材料'], manufacturers: ['东丽', '中复神鹰'], description: '更高强度等级的碳纤维，应用于极端高应力航天结构。' },
  { id: 'ti-6al-4v', name: '钛合金 Ti-6Al-4V', category: '金属', properties: {密度: '4.43 g/cm³', 抗拉强度: '950 MPa', 屈服强度: '880 MPa', 工作温度: '-200~400 °C', 熔点: '1660 °C'}, applications: ['火箭发动机壳体', '高压气瓶', '紧固件', '卫星结构'], manufacturers: ['宝钛集团', 'TIMET', 'VSMPO-AVISMA', 'ATI'], description: '航空航天最常用钛合金，强度高、密度低、耐腐蚀。' },
  { id: 'inconel-718', name: '镍基高温合金 Inconel 718', category: '金属', properties: {密度: '8.19 g/cm³', 抗拉强度: '1240 MPa', 工作温度: '常温~700 °C', 熔点范围: '1260-1336 °C'}, applications: ['火箭发动机涡轮泵', '燃烧室', '喷管', '航空发动机'], manufacturers: ['Special Metals', '宝钢特钢', 'ATI', 'VDM Metals'], description: '高温高强镍基合金，是火箭发动机热端关键材料。' },
  { id: 'al-li', name: '铝锂合金', category: '金属', properties: {密度: '2.55 g/cm³', 抗拉强度: '550 MPa', 工作温度: '-253~120 °C', 比模量: '高'}, applications: ['火箭贮箱', '飞船舱体', '卫星结构件'], manufacturers: ['西南铝', 'Constellium', 'Arconic'], description: '相比传统铝合金减重 7-10%，提高比强度与比刚度，是大型箭体首选轻量化材料。' },
  { id: 'ti-am-powder', name: '增材制造钛粉', category: '金属', properties: {粒度: '15-53 μm', 球形度: '>0.95', 流动性: '良好', 适用工艺: 'SLM/EBM'}, applications: ['3D 打印发动机喷注器', '卫星支架', '复杂格栅结构'], manufacturers: ['顶立科技', 'AP&C', 'Praxair', 'Carpenter'], description: '高球形度高纯度钛合金粉末，是航天 3D 打印的核心原材料。' },
  { id: 'cmc', name: '陶瓷基复合材料 CMC', category: '陶瓷', properties: {密度: '2.4-2.8 g/cm³', 工作温度: '1200-1600 °C', 抗氧化: '优秀', 韧性: '中等'}, applications: ['发动机喷管', '热防护', '高超音速飞行器'], manufacturers: ['航天材料及工艺研究所', 'GE Aerospace', 'Safran'], description: '比金属高温合金更轻更耐高温的复合陶瓷材料。' },
  { id: 'tps-tile', name: '隔热瓦', category: '陶瓷', properties: {密度: '0.14 g/cm³', 工作温度: '~1260 °C', 导热率: '极低', 类型: 'LI-900/HRSI'}, applications: ['航天飞机', 'Starship 隔热瓦', '返回舱', 'X-37B'], manufacturers: ['Lockheed Martin', 'SpaceX', '航天五院 703 所'], description: '极轻质高效隔热材料，承担再入返回时数千度气动加热防护。' },
  { id: 'ceramic-coating', name: '高温陶瓷涂层', category: '陶瓷', properties: {厚度: '100-500 μm', 工作温度: '~1500 °C', 涂层种类: 'YSZ/EB-PVD', 抗氧化: '优秀'}, applications: ['发动机叶片', '燃烧室壁', '热防护表面'], manufacturers: ['Praxair Surface Tech', '中航工业', 'Oerlikon'], description: '通过表面涂层提升基体抗高温与抗腐蚀能力。' },
  { id: 'polyimide-film', name: '聚酰亚胺薄膜', category: '聚合物', properties: {密度: '1.42 g/cm³', 工作温度: '-269~400 °C', 介电强度: '高', 厚度范围: '7-125 μm'}, applications: ['卫星热控多层隔热毯 MLI', '柔性电路板', '太阳电池基板'], manufacturers: ['DuPont (Kapton)', '时代新材', 'UBE'], description: '航天器表面热控与柔性电子的关键聚合物薄膜。' },
  { id: 'mg-alloy', name: '镁合金', category: '金属', properties: {密度: '1.74 g/cm³', 抗拉强度: '280 MPa', 工作温度: '-200~150 °C', 比强度: '高'}, applications: ['卫星结构件', '相机壳体', '电子设备外壳'], manufacturers: ['宝武镁业', 'Magnesium Elektron'], description: '密度最低的工程金属，适合对重量敏感的航天器结构。' },
  { id: 'ss-304l-316l', name: '不锈钢 304L/316L', category: '金属', properties: {密度: '8.0 g/cm³', 抗拉强度: '485 MPa', 工作温度: '-253~600 °C', 耐腐蚀性: '优秀'}, applications: ['Starship 箭体', '低温管路', '储箱', '阀门'], manufacturers: ['宝钢', 'Outokumpu', 'POSCO'], description: 'SpaceX Starship 创新性使用大量不锈钢作为主结构材料。' },
  { id: 'tungsten-alloy', name: '钨合金', category: '金属', properties: {密度: '17.5 g/cm³', 熔点: '3422 °C', 抗烧蚀: '极强', 抗高温: '极高'}, applications: ['发动机喉衬', '辐射屏蔽', '配重'], manufacturers: ['钨业股份', 'H.C. Starck', 'Plansee'], description: '高密度高熔点金属，承担发动机喉衬与辐射屏蔽功能。' },
  { id: 'sic-cmc', name: 'SiC/SiC 陶瓷复合材料', category: '陶瓷', properties: {密度: '2.7 g/cm³', 工作温度: '~1400 °C', 比强度: '高', 抗氧化: '优秀'}, applications: ['发动机热端', '高超音速飞行器', '空天飞机'], manufacturers: ['GE Aerospace', 'Safran Ceramics', '航天材料及工艺研究所'], description: '比传统高温合金减重 30-50%，是下一代航空航天热端结构材料。' },
  { id: 'gf-composite', name: '玻璃纤维复合材料', category: '复合材料', properties: {密度: '2.0 g/cm³', 抗拉强度: '3.5 GPa', 工作温度: '-50~200 °C', 介电常数: '低'}, applications: ['整流罩', '雷达罩', '电子设备外壳'], manufacturers: ['泰山玻纤', 'Owens Corning', 'PPG'], description: '低介电特性使其特别适合作为透波结构件。' },
];

const equipment = [
  { id: 'thermal-vacuum-chamber', name: '真空热环境模拟器', category: '测试', manufacturer: '航天五院 / Astrium', specifications: {真空度: '10^-7 Pa', 温度范围: '-180~150 °C', 直径: '8-15 m', 长度: '15-22 m', 太阳模拟器: '5-1500 W/m²'}, applications: ['卫星整星热平衡试验', '航天器在轨工况模拟', '材料真空老化'], description: '模拟太空真空、低温与太阳辐射环境，对整星进行热真空与热平衡试验。' },
  { id: 'vibration-table', name: '振动试验台', category: '测试', manufacturer: 'MTS / 苏试试验', specifications: {推力: '50-700 kN', 频率范围: '5-2000 Hz', 加速度: '~100 g', 控制方式: '正弦/随机/冲击'}, applications: ['火箭发射力学环境模拟', '组件鉴定试验', '产品验收测试'], description: '模拟火箭发射时的力学环境，验证航天产品结构可靠性。' },
  { id: 'thermal-vacuum-tank', name: '热真空罐', category: '测试', manufacturer: '航天五院', specifications: {真空度: '10^-6 Pa', 温度范围: '-100~120 °C', 容积: '5-50 m³'}, applications: ['组件级热真空试验', '材料出气测试', '小型卫星整星试验'], description: '小尺寸热真空环境模拟设备，用于组件与小卫星热真空试验。' },
  { id: 'neutral-buoyancy-pool', name: '大型水池', category: '测试', manufacturer: '航天员训练中心', specifications: {直径: '23 m', 深度: '12 m', 水量: '5000 m³', 水温: '28-30 °C'}, applications: ['航天员舱外活动训练', '机械臂操作训练', '装配工艺验证'], description: '通过中性浮力模拟太空失重环境，是航天员舱外训练的关键设施。' },
  { id: 'wind-tunnel', name: '风洞', category: '测试', manufacturer: '空气动力研究院', specifications: {马赫数范围: '0.3-25', 试验段: '1-3 m', 压力: '可调', 温度: '可调'}, applications: ['火箭气动设计', '高超音速飞行器试验', '再入热环境'], description: '从亚音速到高超音速的气动环境试验设备。' },
  { id: 'cnc-5-axis', name: '五轴数控机床', category: '制造', manufacturer: 'DMG MORI / Mazak', specifications: {行程: '3000×2000×1500 mm', 主轴转速: '20000 rpm', 定位精度: '5 μm', 联动轴数: '5'}, applications: ['火箭发动机零件', '卫星结构件', '复杂曲面加工'], description: '高精度五轴联动加工设备，满足复杂航天零件高精度需求。' },
  { id: 'ebm-welder', name: '电子束焊接机', category: '制造', manufacturer: '航天科工 / pro-beam', specifications: {电压: '60-150 kV', 电流: '0-500 mA', 真空度: '10^-3 Pa', 焊接深度: '20-200 mm'}, applications: ['火箭储箱', '发动机喷管', '深焊高强结构'], description: '在真空环境下进行高能量密度精密焊接，适合厚壁高强材料。' },
  { id: 'laser-cutter', name: '激光切割机', category: '制造', manufacturer: 'Trumpf / Bystronic', specifications: {功率: '6-15 kW', 切割厚度: '0.5-30 mm', 精度: '±0.05 mm', 类型: '光纤/CO2'}, applications: ['薄板下料', '复合材料切割', '钛合金加工'], description: '高速精密切割设备，适合多种金属与复合材料加工。' },
  { id: 'mobile-launch-platform', name: '移动发射平台', category: '发射', manufacturer: 'NASA / CASC', specifications: {载重: '5000-8000 t', 高度: '120-160 m', 移动速度: '~1 km/h', 推力支撑: '可承载重型火箭'}, applications: ['SLS / Starship / 长征九号'], description: '将装配完毕的火箭从总装厂房转运至发射工位的大型平台。' },
  { id: 'dsn-antenna-35m', name: '35米测控天线', category: '地面', manufacturer: 'NASA / 航天测控通信集团', specifications: {口径: '35 m', 频段: 'S/X/Ka', 接收灵敏度: '极高', 跟踪精度: '0.001°'}, applications: ['深空探测器测控', '行星际通信', '科学数据接收'], description: '深空网核心设施，承担月球、火星、外太阳系探测器测控通信任务。' },
  { id: 'rocket-transporter', name: '火箭转运车', category: '发射', manufacturer: 'CASC / Energomash', specifications: {载重: '1000-2000 t', 长度: '50-80 m', 移动速度: '5 km/h', 平台稳定性: '高'}, applications: ['火箭水平转运', '助推器运输'], description: '在工厂、铁路、发射场之间运输火箭子级与整箭的大型车辆。' },
  { id: 'satellite-cleanroom', name: '卫星总装洁净厂房', category: '制造', manufacturer: '航天科技集团 / Lockheed Martin', specifications: {洁净度: 'ISO 5 / Class 100', 面积: '1000-10000 m²', 高度: '20-40 m', 起重能力: '20-100 t'}, applications: ['卫星总装', '飞船总装', '探测器集成'], description: '卫星总装、调试与测试的高洁净度厂房，是航天器制造关键基础设施。' },
];

async function main() {
  console.log('Seeding industry chain data...');
  for (const seg of industrySegments) {
    await prisma.industrySegment.upsert({ where: { id: seg.id }, update: seg, create: seg });
  }
  console.log(`✓ ${industrySegments.length} industry segments`);

  for (const c of companies) {
    await prisma.company.upsert({ where: { id: c.id }, update: c, create: c });
  }
  console.log(`✓ ${companies.length} companies`);

  for (const link of companySegmentLinks) {
    await prisma.companySegment.upsert({
      where: { companyId_segmentId: { companyId: link.companyId, segmentId: link.segmentId } },
      update: {},
      create: link,
    });
  }
  console.log(`✓ ${companySegmentLinks.length} company-segment links`);

  for (const t of technologies) {
    await prisma.technology.upsert({ where: { id: t.id }, update: t, create: t });
  }
  console.log(`✓ ${technologies.length} technologies`);

  for (const m of materials) {
    await prisma.material.upsert({ where: { id: m.id }, update: m, create: m });
  }
  console.log(`✓ ${materials.length} materials`);

  for (const e of equipment) {
    await prisma.equipment.upsert({ where: { id: e.id }, update: e, create: e });
  }
  console.log(`✓ ${equipment.length} equipment`);

  console.log('Industry seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
