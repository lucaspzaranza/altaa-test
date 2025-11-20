import prisma from "../src/prismaClient"
import bcrypt from "bcrypt";

async function main() {
  await prisma.membership.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const pwd = await bcrypt.hash("password123", 10);
  const alice = await prisma.user.create({ data: { email: "alice@example.com", name: "Alice", passwordHash: pwd } });
  const bob = await prisma.user.create({ data: { email: "bob@example.com", name: "Bob", passwordHash: pwd } });

  const company = await prisma.company.create({ data: { name: "Acme Corp" } });
  await prisma.membership.createMany({
    data: [
      { userId: alice.id, companyId: company.id, role: "OWNER" },
      { userId: bob.id, companyId: company.id, role: "MEMBER" }
    ]
  });

  console.log("Seed done");
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
