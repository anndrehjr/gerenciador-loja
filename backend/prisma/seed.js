import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { normalizePhone } from "../src/utils/phone.js";

const prisma = new PrismaClient();

const SERVICES = [
  { name: "Corte feminino", priceCents: 8000, durationMinutes: 45, description: "Corte + finalização" },
  { name: "Corte masculino", priceCents: 5000, durationMinutes: 30, description: "Corte na tesoura e/ou máquina" },
  { name: "Corte infantil", priceCents: 4000, durationMinutes: 30, description: "Até 10 anos" },
  { name: "Coloração", priceCents: 15000, durationMinutes: 120, description: "Coloração completa" },
  { name: "Mechas / Luzes", priceCents: 18000, durationMinutes: 150, description: "Técnica de mechas com papel alumínio" },
  { name: "Hidratação", priceCents: 7000, durationMinutes: 45, description: "Hidratação profunda com máscara" },
  { name: "Escova", priceCents: 6000, durationMinutes: 40, description: "Escova modeladora" },
  { name: "Penteado para festa", priceCents: 12000, durationMinutes: 60, description: "Penteado + finalização para eventos" },
  { name: "Barba", priceCents: 3500, durationMinutes: 20, description: "Modelagem completa com toalha quente" },
  { name: "Design de sobrancelha", priceCents: 2500, durationMinutes: 15, description: "Design com pinça e linha" },
  { name: "Manicure", priceCents: 4000, durationMinutes: 40, description: "Cutilagem e esmaltação" },
  { name: "Pedicure", priceCents: 4500, durationMinutes: 40, description: "Cutilagem e esmaltação dos pés" },
];

const PROFESSIONALS = [
  {
    name: "Camila Duarte",
    specialty: "Coloração e mechas",
    bio: "Especialista em coloração com 8 anos de experiência.",
    workingHours: [1, 2, 3, 4, 5].map((weekday) => ({ weekday, startMinute: 9 * 60, endMinute: 18 * 60 })),
  },
  {
    name: "Rodrigo Nunes",
    specialty: "Cortes masculinos e barba",
    bio: "Barbeiro clássico, especialista em navalha.",
    workingHours: [2, 3, 4, 5, 6].map((weekday) => ({ weekday, startMinute: 10 * 60, endMinute: 19 * 60 })),
  },
];

const CLIENTS = [
  { name: "Maria Oliveira", email: "maria.oliveira@example.com", phone: "(11) 98111-2233" },
  { name: "Ana Souza", email: "ana.souza@example.com", phone: "(11) 98222-3344" },
  { name: "Juliana Costa", email: "juliana.costa@example.com", phone: "(11) 98333-4455" },
  { name: "Fernanda Lima", email: "fernanda.lima@example.com", phone: "(11) 98444-5566" },
  { name: "Patrícia Alves", email: "patricia.alves@example.com", phone: "(11) 98555-6677" },
  { name: "Camila Rocha", email: "camila.rocha@example.com", phone: "(11) 98666-7788" },
  { name: "Beatriz Santos", email: "beatriz.santos@example.com", phone: "(11) 98777-8899" },
  { name: "Larissa Pereira", email: "larissa.pereira@example.com", phone: "(11) 98888-9900" },
  { name: "Rafael Almeida", email: "rafael.almeida@example.com", phone: "(11) 97111-2233" },
  { name: "Bruno Carvalho", email: "bruno.carvalho@example.com", phone: "(11) 97222-3344" },
  { name: "Gustavo Mendes", email: "gustavo.mendes@example.com", phone: "(11) 97333-4455" },
  { name: "Lucas Ferreira", email: "lucas.ferreira@example.com", phone: "(11) 97444-5566" },
];

// deslocamento em dias a partir de hoje, hora do dia, status e observação opcional
const APPOINTMENT_PLAN = [
  { dayOffset: -12, hour: 14, status: "CONCLUIDO" },
  { dayOffset: -10, hour: 10, status: "CONCLUIDO" },
  { dayOffset: -9, hour: 16, status: "CONCLUIDO" },
  { dayOffset: -7, hour: 9, status: "CONCLUIDO" },
  { dayOffset: -6, hour: 15, status: "CONCLUIDO", notes: "Cliente pediu tom mais claro na próxima vez" },
  { dayOffset: -4, hour: 11, status: "CONCLUIDO" },
  { dayOffset: -3, hour: 13, status: "CANCELADO", notes: "Cliente remarcou" },
  { dayOffset: -2, hour: 17, status: "CONCLUIDO" },
  { dayOffset: -1, hour: 10, status: "CONCLUIDO" },
  { dayOffset: 0, hour: 16, status: "CONFIRMADO" },
  { dayOffset: 1, hour: 9, status: "CONFIRMADO" },
  { dayOffset: 1, hour: 14, status: "AGENDADO" },
  { dayOffset: 2, hour: 11, status: "AGENDADO" },
  { dayOffset: 3, hour: 15, status: "AGENDADO", notes: "Primeira vez no salão" },
  { dayOffset: 4, hour: 10, status: "AGENDADO" },
  { dayOffset: 5, hour: 13, status: "AGENDADO" },
  { dayOffset: 6, hour: 16, status: "CANCELADO" },
  { dayOffset: 8, hour: 9, status: "AGENDADO" },
  { dayOffset: 10, hour: 14, status: "AGENDADO" },
];

function ensureService(data) {
  return prisma.service.upsert({
    where: { name: data.name },
    update: { durationMinutes: data.durationMinutes },
    create: data,
  });
}

function ensureClient(data) {
  return prisma.client.upsert({
    where: { email: data.email },
    update: {},
    create: { ...data, phone: normalizePhone(data.phone) },
  });
}

async function ensureProfessional(data) {
  let professional = await prisma.professional.findFirst({ where: { name: data.name } });
  if (!professional) {
    professional = await prisma.professional.create({
      data: { name: data.name, specialty: data.specialty, bio: data.bio },
    });
    await prisma.workingHour.createMany({
      data: data.workingHours.map((h) => ({ ...h, professionalId: professional.id })),
    });
  }
  return professional;
}

function dateAt(dayOffset, hour) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@salao.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error(
      "Defina SEED_ADMIN_PASSWORD no ambiente antes de rodar o seed (ex.: SEED_ADMIN_PASSWORD=... npm run seed)."
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Usuário admin pronto: ${admin.email}`);

  const services = [];
  for (const data of SERVICES) {
    services.push(await ensureService(data));
  }
  console.log(`Catálogo de serviços pronto: ${services.length} serviços.`);

  const clients = [];
  for (const data of CLIENTS) {
    clients.push(await ensureClient(data));
  }
  console.log(`Clientes prontos: ${clients.length} clientes.`);

  const professionals = [];
  for (const data of PROFESSIONALS) {
    professionals.push(await ensureProfessional(data));
  }
  console.log(`Profissionais prontos: ${professionals.length} profissionais.`);

  const appointmentCount = await prisma.appointment.count();
  if (appointmentCount === 0) {
    for (let i = 0; i < APPOINTMENT_PLAN.length; i++) {
      const plan = APPOINTMENT_PLAN[i];
      const client = clients[i % clients.length];
      const service = services[(i * 3) % services.length];
      const professional = professionals[i % professionals.length];
      await prisma.appointment.create({
        data: {
          clientId: client.id,
          serviceId: service.id,
          professionalId: professional.id,
          date: dateAt(plan.dayOffset, plan.hour),
          status: plan.status,
          notes: plan.notes || null,
        },
      });
    }
    console.log(`Agendamentos de exemplo criados: ${APPOINTMENT_PLAN.length}.`);
  } else {
    console.log("Já existem agendamentos — mantidos como estão.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
