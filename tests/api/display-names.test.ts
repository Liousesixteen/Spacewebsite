import assert from 'node:assert/strict';
import test from 'node:test';
import {
  displayAgencyName,
  displayCountryName,
  displayLaunchName,
  displayLocalizedDescription,
  displayMissionType,
  displayOrbitName,
  displaySiteName,
} from '../../lib/display-names';
import { displayIndustryCompanyName } from '../../lib/industry-display';

test('localizes common launch fields for Chinese', () => {
  assert.equal(
    displayLaunchName('Long March 7A | Unknown Payload', 'zh-CN'),
    '长征七号甲 | 未知载荷'
  );
  assert.equal(displayMissionType('Human Exploration', 'zh-CN'), '载人探索');
  assert.equal(displayOrbitName('Low Earth Orbit', 'LEO', 'zh-CN'), '近地轨道');
  assert.equal(displayCountryName('USA', 'zh-CN'), '美国');
});

test('localizes raw provider, site, and science taxonomy values', () => {
  assert.equal(displayAgencyName('Unknown', 'zh-CN'), '未知机构');
  assert.equal(displayAgencyName('Isar Aerospace', 'zh-CN'), '伊萨尔航空航天');
  assert.equal(
    displaySiteName('Rocket Lab Launch Complex 1, Mahia Peninsula, New Zealand', 'zh-CN'),
    '火箭实验室 1 号发射复合体（新西兰马希亚）'
  );
  assert.equal(displayMissionType('Astrophysics', 'zh-CN'), '天体物理学');
  assert.equal(displayMissionType('Lunar Exploration', 'zh-CN'), '月球探测');
});

test('preserves source names for English', () => {
  assert.equal(
    displayLaunchName('Falcon 9 Block 5 | Starlink 12-1', 'en'),
    'Falcon 9 Block 5 | Starlink 12-1'
  );
  assert.equal(displayCountryName('CHN', 'en'), 'China');
});

test('uses locale-aware display names for industry companies', () => {
  assert.equal(
    displayIndustryCompanyName('中国航天科技集团', 'en'),
    'China Aerospace Science and Technology Corporation'
  );
  assert.equal(displayIndustryCompanyName('Rocket Lab', 'zh-CN'), '火箭实验室');
});

test('hides placeholder or untranslated prose behind a localized fallback', () => {
  assert.equal(displayLocalizedDescription('Details TBD.', 'zh-CN', '等待任务说明'), '等待任务说明');
  assert.equal(
    displayLocalizedDescription('A communications satellite mission.', 'zh-CN', '等待任务说明'),
    '等待任务说明'
  );
  assert.equal(
    displayLocalizedDescription('通信卫星发射任务。', 'zh-CN', '等待任务说明'),
    '通信卫星发射任务。'
  );
});
