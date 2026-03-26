const { PrismaClient } = require("../src/generated/prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  
  const password = await bcrypt.hash("123456", 10);

  // Users
  const admin = await prisma.user.create({
    data: { name: "Admin APM", email: "admin@apmgroup.pe", role: "ADMIN", password }
  });

  const consultor = await prisma.user.create({
    data: { name: "Carlos Consultor", email: "carlos@apmgroup.pe", role: "CONSULTOR", password }
  });

  // Client and User Client
  const clientCompany = await prisma.client.create({
    data: { companyName: "Minera Sur SAC", status: "ACTIVO" }
  });

  const clienteUser = await prisma.user.create({
    data: { name: "Gerente Minera Sur", email: "gerente@minerasur.com", role: "CLIENTE", password, companyId: clientCompany.id }
  });

  // Project
  const project = await prisma.project.create({
    data: {
      name: "Auditoría HSEQ - Minera Sur",
      clientId: clientCompany.id,
      consultantId: consultor.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  // Goals
  const mockGoals = [
    { name: "Auditoría de procesos RRHH", completed: true },
    { name: "Evaluación de riesgos operativos", completed: true },
    { name: "Revisión de cumplimiento normativo", completed: false },
    { name: "Informe de diagnóstico inicial", completed: false },
    { name: "Capacitación al equipo", completed: false },
  ];

  for (const g of mockGoals) {
    await prisma.goal.create({
      data: {
        projectId: project.id,
        description: g.name,
        type: "SEMANAL",
        isCompleted: g.completed
      }
    });
  }

  // Prospects
  const prospects = [
    { companyName: "Tech Solutions SAC", contactName: "Valeria Morales", status: "NEGOCIACION", firstContactDate: new Date("2026-01-25"), lastInteractionDate: new Date("2026-03-19") },
    { companyName: "Constructora Lima", contactName: "Patricia Flores", status: "NUEVO", firstContactDate: new Date("2026-03-05"), lastInteractionDate: new Date("2026-03-15") }
  ];

  for (const p of prospects) {
    await prisma.prospect.create({ data: p });
  }

  console.log("Database seeded correctly! Demo Project ID:", project.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
