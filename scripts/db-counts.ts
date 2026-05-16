import { prisma } from '../lib/db';

async function main() {
  const [launches, rockets, spacecraft, astronauts, launchSites, companies, technologies, materials, equipment] = await Promise.all([
    prisma.launch.count(),
    prisma.rocket.count(),
    prisma.spacecraft.count(),
    prisma.astronaut.count(),
    prisma.launchSite.count(),
    prisma.company.count(),
    prisma.technology.count(),
    prisma.material.count(),
    prisma.equipment.count(),
  ]);
  console.log('Database counts:');
  console.log(`  launches:     ${launches}`);
  console.log(`  rockets:      ${rockets}`);
  console.log(`  spacecraft:   ${spacecraft}`);
  console.log(`  astronauts:   ${astronauts}`);
  console.log(`  launchSites:  ${launchSites}`);
  console.log(`  companies:    ${companies}`);
  console.log(`  technologies: ${technologies}`);
  console.log(`  materials:    ${materials}`);
  console.log(`  equipment:    ${equipment}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
