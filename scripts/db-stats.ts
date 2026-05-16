import { prisma } from '../lib/db';

async function main() {
  const byOperator = await prisma.spacecraft.groupBy({
    by: ['operator'],
    _count: true,
    orderBy: { _count: { operator: 'desc' } },
    take: 20,
  });

  console.log('Top 20 spacecraft operators (countries):');
  for (const r of byOperator) {
    console.log(`  ${r.operator.padEnd(30)} ${r._count}`);
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
