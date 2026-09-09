import assert from 'node:assert/strict';
import test from 'node:test';
import { assessSchemaHealth } from '../../lib/api/schema-health';

test('schema health is up when every required table is present', () => {
  assert.deepEqual(assessSchemaHealth(['Company', 'ProductCapability']), {
    status: 'up',
    missingTables: [],
  });
});

test('schema health identifies the missing optional-capability table', () => {
  assert.deepEqual(assessSchemaHealth(['Company']), {
    status: 'down',
    missingTables: ['ProductCapability'],
  });
});
