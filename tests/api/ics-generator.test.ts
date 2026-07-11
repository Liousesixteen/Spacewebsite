import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  generateSingleEventIcs,
  generateCalendarIcs,
} from '../../lib/api/ics-generator';

const LAUNCH_DATE = new Date('2026-08-15T14:30:00Z');
const LAUNCH_END = new Date('2026-08-15T16:30:00Z');

describe('generateSingleEventIcs', () => {
  it('produces a valid VCALENDAR with required fields', () => {
    const ics = generateSingleEventIcs({
      uid: 'test-launch-1',
      title: 'CZ-5B | Wentian',
      startDate: LAUNCH_DATE,
      location: 'Wenchang, China',
    });

    assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
    assert.ok(ics.endsWith('END:VCALENDAR'));
    assert.ok(ics.includes('VERSION:2.0'));
    assert.ok(ics.includes('PRODID:-//SpaceData//Launch Calendar//EN'));
    assert.ok(ics.includes('BEGIN:VEVENT'));
    assert.ok(ics.includes('END:VEVENT'));
    assert.ok(ics.includes('DTSTART:20260815T143000Z'));
    assert.ok(ics.includes('SUMMARY:CZ-5B | Wentian'));
    assert.ok(ics.includes('UID:test-launch-1'));
  });

  it('includes end date when provided', () => {
    const ics = generateSingleEventIcs({
      uid: 'test-2',
      title: 'Launch',
      startDate: LAUNCH_DATE,
      endDate: LAUNCH_END,
    });

    assert.ok(ics.includes('DTEND:20260815T163000Z'));
  });

  it('generates a default 2-hour end date when none is provided', () => {
    const ics = generateSingleEventIcs({
      uid: 'test-3',
      title: 'Launch',
      startDate: LAUNCH_DATE,
    });

    assert.ok(ics.includes('DTEND:20260815T163000Z'));
  });

  it('includes a 30-minute reminder alarm', () => {
    const ics = generateSingleEventIcs({
      uid: 'test-4',
      title: 'Launch',
      startDate: LAUNCH_DATE,
    });

    assert.ok(ics.includes('BEGIN:VALARM'));
    assert.ok(ics.includes('TRIGGER:-PT30M'));
    assert.ok(ics.includes('ACTION:DISPLAY'));
    assert.ok(ics.includes('END:VALARM'));
  });

  it('escapes special characters in text fields', () => {
    const ics = generateSingleEventIcs({
      uid: 'test-5',
      title: 'Launch; with, special\\chars',
      startDate: LAUNCH_DATE,
      description: 'Multi\\nline; description',
    });

    assert.ok(ics.includes('SUMMARY:Launch\\; with\\, special\\\\chars'));
    assert.ok(ics.includes('DESCRIPTION:Multi\\\\nline\\; description'));
  });

  it('includes optional fields when provided', () => {
    const ics = generateSingleEventIcs({
      uid: 'test-6',
      title: 'Launch',
      startDate: LAUNCH_DATE,
      url: 'https://example.com/launch/1',
      categories: ['Rocket Launch', 'Science'],
    });

    assert.ok(ics.includes('URL:https://example.com/launch/1'));
    assert.ok(ics.includes('CATEGORIES:Rocket Launch,Science'));
  });
});

describe('generateCalendarIcs', () => {
  it('produces a calendar with multiple events', () => {
    const ics = generateCalendarIcs([
      {
        uid: 'event-1',
        title: 'Launch 1',
        startDate: LAUNCH_DATE,
      },
      {
        uid: 'event-2',
        title: 'Launch 2',
        startDate: new Date('2026-08-20T10:00:00Z'),
        location: 'Cape Canaveral',
      },
    ]);

    assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
    assert.ok(ics.endsWith('END:VCALENDAR'));
    assert.ok(ics.includes('SUMMARY:Launch 1'));
    assert.ok(ics.includes('SUMMARY:Launch 2'));

    // Should have two VEVENT blocks
    const eventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
    assert.equal(eventCount, 2);
  });
});
