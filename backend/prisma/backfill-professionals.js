// Script único e idempotente: preenche a duração dos serviços existentes e
// cria os profissionais de exemplo, sem tocar em User/Client/Appointment.
// Uso: node prisma/backfill-professionals.js
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SERVICE_DURATIONS = {
  "Corte feminino": 45,
  "Corte masculino": 30,
  "Corte infantil": 30,
  Coloração: 120,
  "Mechas / Luzes": 150,
  Hidratação: 45,
  Escova: 40,
  "Penteado para festa": 60,
  Barba: 20,
  "Design de sobrancelha": 15,
  Manicure: 40,
  Pedicure: 40,
};

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

async function main() {
  for (const [name, durationMinutes] of Object.entries(SERVICE_DURATIONS)) {
    const { count } = await prisma.service.updateMany({ where: { name }, data: { durationMinutes } });
    if (count > 0) console.log(`Duração atualizada: ${name} -> ${durationMinutes} min`);
  }

  for (const data of PROFESSIONALS) {
    let professional = await prisma.professional.findFirst({ where: { name: data.name } });
    if (!professional) {
      professional = await prisma.professional.create({
        data: { name: data.name, specialty: data.specialty, bio: data.bio },
      });
      await prisma.workingHour.createMany({
        data: data.workingHours.map((h) => ({ ...h, professionalId: professional.id })),
      });
      console.log(`Profissional criado: ${professional.name}`);
    } else {
      console.log(`Profissional já existia: ${professional.name}`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
