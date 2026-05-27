import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const routes = await prisma.$queryRaw`
    SELECT id, code, ST_AsText("outboundPath") as outbound, ST_AsText("returnPath") as return
    FROM "Route"
    LIMIT 1
  `;
  console.dir(routes, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
