export const REQUIRED_SCHEMA_TABLES = ['ProductCapability'] as const;

export interface SchemaHealth {
  status: 'up' | 'down';
  missingTables: string[];
}

export function assessSchemaHealth(presentTables: readonly string[]): SchemaHealth {
  const present = new Set(presentTables);
  const missingTables = REQUIRED_SCHEMA_TABLES.filter((table) => !present.has(table));

  return {
    status: missingTables.length === 0 ? 'up' : 'down',
    missingTables: [...missingTables],
  };
}
