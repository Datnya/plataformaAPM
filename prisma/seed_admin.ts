import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

process.env.DATABASE_URL = "file:./dev.db";
const prisma = new PrismaClient();

async function main() {
  console.log("Creando usuario ADMIN semilla...");

  const password = await bcrypt.hash("Brendilu7700", 10);
  const email = "dmonzon@apmgroup.pe";

  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { email },
      data: { password, role: "ADMIN", status: "ACTIVO" }
    });
    console.log("Admin actualizado correctamente.");
  } else {
    await prisma.user.create({
      data: { 
        name: "Diana Monzón",
        email,
        role: "ADMIN",
        password,
        status: "ACTIVO"
      }
    });
    console.log("Admin creado correctamente.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
