import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { normalizarTelefone } from "../src/utilitarios/telefone.js";

const prisma = new PrismaClient();

const SERVICOS = [
  { nome: "Corte feminino", precoCentavos: 8000, duracaoMinutos: 45, descricao: "Corte + finalização" },
  { nome: "Corte masculino", precoCentavos: 5000, duracaoMinutos: 30, descricao: "Corte na tesoura e/ou máquina" },
  { nome: "Corte infantil", precoCentavos: 4000, duracaoMinutos: 30, descricao: "Até 10 anos" },
  { nome: "Coloração", precoCentavos: 15000, duracaoMinutos: 120, descricao: "Coloração completa" },
  { nome: "Mechas / Luzes", precoCentavos: 18000, duracaoMinutos: 150, descricao: "Técnica de mechas com papel alumínio" },
  { nome: "Hidratação", precoCentavos: 7000, duracaoMinutos: 45, descricao: "Hidratação profunda com máscara" },
  { nome: "Escova", precoCentavos: 6000, duracaoMinutos: 40, descricao: "Escova modeladora" },
  { nome: "Penteado para festa", precoCentavos: 12000, duracaoMinutos: 60, descricao: "Penteado + finalização para eventos" },
  { nome: "Barba", precoCentavos: 3500, duracaoMinutos: 20, descricao: "Modelagem completa com toalha quente" },
  { nome: "Design de sobrancelha", precoCentavos: 2500, duracaoMinutos: 15, descricao: "Design com pinça e linha" },
  { nome: "Manicure", precoCentavos: 4000, duracaoMinutos: 40, descricao: "Cutilagem e esmaltação" },
  { nome: "Pedicure", precoCentavos: 4500, duracaoMinutos: 40, descricao: "Cutilagem e esmaltação dos pés" },
];

const PROFISSIONAIS = [
  {
    nome: "Camila Duarte",
    especialidade: "Coloração e mechas",
    bio: "Especialista em coloração com 8 anos de experiência.",
    horariosTrabalho: [1, 2, 3, 4, 5].map((diaSemana) => ({
      diaSemana,
      minutoInicio: 9 * 60,
      minutoFim: 18 * 60,
    })),
  },
  {
    nome: "Rodrigo Nunes",
    especialidade: "Cortes masculinos e barba",
    bio: "Barbeiro clássico, especialista em navalha.",
    horariosTrabalho: [2, 3, 4, 5, 6].map((diaSemana) => ({
      diaSemana,
      minutoInicio: 10 * 60,
      minutoFim: 19 * 60,
    })),
  },
];

const CLIENTES = [
  { nome: "Maria Oliveira", email: "maria.oliveira@example.com", telefone: "(11) 98111-2233" },
  { nome: "Ana Souza", email: "ana.souza@example.com", telefone: "(11) 98222-3344" },
  { nome: "Juliana Costa", email: "juliana.costa@example.com", telefone: "(11) 98333-4455" },
  { nome: "Fernanda Lima", email: "fernanda.lima@example.com", telefone: "(11) 98444-5566" },
  { nome: "Patrícia Alves", email: "patricia.alves@example.com", telefone: "(11) 98555-6677" },
  { nome: "Camila Rocha", email: "camila.rocha@example.com", telefone: "(11) 98666-7788" },
  { nome: "Beatriz Santos", email: "beatriz.santos@example.com", telefone: "(11) 98777-8899" },
  { nome: "Larissa Pereira", email: "larissa.pereira@example.com", telefone: "(11) 98888-9900" },
  { nome: "Rafael Almeida", email: "rafael.almeida@example.com", telefone: "(11) 97111-2233" },
  { nome: "Bruno Carvalho", email: "bruno.carvalho@example.com", telefone: "(11) 97222-3344" },
  { nome: "Gustavo Mendes", email: "gustavo.mendes@example.com", telefone: "(11) 97333-4455" },
  { nome: "Lucas Ferreira", email: "lucas.ferreira@example.com", telefone: "(11) 97444-5566" },
];

// deslocamento em dias a partir de hoje, hora do dia, status e observação opcional
const PLANO_AGENDAMENTOS = [
  { diasOffset: -12, hora: 14, status: "CONCLUIDO" },
  { diasOffset: -10, hora: 10, status: "CONCLUIDO" },
  { diasOffset: -9, hora: 16, status: "CONCLUIDO" },
  { diasOffset: -7, hora: 9, status: "CONCLUIDO" },
  { diasOffset: -6, hora: 15, status: "CONCLUIDO", observacoes: "Cliente pediu tom mais claro na próxima vez" },
  { diasOffset: -4, hora: 11, status: "CONCLUIDO" },
  { diasOffset: -3, hora: 13, status: "CANCELADO", observacoes: "Cliente remarcou" },
  { diasOffset: -2, hora: 17, status: "CONCLUIDO" },
  { diasOffset: -1, hora: 10, status: "CONCLUIDO" },
  { diasOffset: 0, hora: 16, status: "CONFIRMADO" },
  { diasOffset: 1, hora: 9, status: "CONFIRMADO" },
  { diasOffset: 1, hora: 14, status: "AGENDADO" },
  { diasOffset: 2, hora: 11, status: "AGENDADO" },
  { diasOffset: 3, hora: 15, status: "AGENDADO", observacoes: "Primeira vez no salão" },
  { diasOffset: 4, hora: 10, status: "AGENDADO" },
  { diasOffset: 5, hora: 13, status: "AGENDADO" },
  { diasOffset: 6, hora: 16, status: "CANCELADO" },
  { diasOffset: 8, hora: 9, status: "AGENDADO" },
  { diasOffset: 10, hora: 14, status: "AGENDADO" },
];

function garantirServico(salaoId, dados) {
  return prisma.servico.upsert({
    where: { salaoId_nome: { salaoId, nome: dados.nome } },
    update: { duracaoMinutos: dados.duracaoMinutos },
    create: { ...dados, salaoId },
  });
}

function garantirCliente(salaoId, dados) {
  return prisma.cliente.upsert({
    where: { salaoId_email: { salaoId, email: dados.email } },
    update: {},
    create: { ...dados, salaoId, telefone: normalizarTelefone(dados.telefone) },
  });
}

async function garantirProfissional(salaoId, dados) {
  let profissional = await prisma.profissional.findFirst({ where: { salaoId, nome: dados.nome } });
  if (!profissional) {
    profissional = await prisma.profissional.create({
      data: { nome: dados.nome, especialidade: dados.especialidade, bio: dados.bio, salaoId },
    });
    await prisma.horarioTrabalho.createMany({
      data: dados.horariosTrabalho.map((h) => ({ ...h, profissionalId: profissional.id, salaoId })),
    });
  }
  return profissional;
}

function dataEm(diasOffset, hora) {
  const data = new Date();
  data.setDate(data.getDate() + diasOffset);
  data.setHours(hora, 0, 0, 0);
  return data;
}

async function main() {
  const salaoSlug = process.env.SEED_SALAO_SLUG || "salao-andre";
  const salaoNome = process.env.SEED_SALAO_NOME || "Salão";
  const salaoDominio = process.env.SEED_SALAO_DOMINIO || null;

  const salao = await prisma.salao.upsert({
    where: { slug: salaoSlug },
    update: {},
    create: { slug: salaoSlug, nome: salaoNome, dominio: salaoDominio },
  });
  console.log(`Salão pronto: ${salao.nome} (${salao.slug})`);

  const emailAdmin = process.env.SEED_ADMIN_EMAIL || "admin@salao.local";
  const senhaAdmin = process.env.SEED_ADMIN_SENHA;

  if (!senhaAdmin) {
    throw new Error(
      "Defina SEED_ADMIN_SENHA no ambiente antes de rodar o seed (ex.: SEED_ADMIN_SENHA=... npm run seed)."
    );
  }

  const senhaHash = await bcrypt.hash(senhaAdmin, 12);

  const admin = await prisma.usuario.upsert({
    where: { email: emailAdmin },
    update: { senhaHash, salaoId: salao.id },
    create: {
      nome: "Administrador",
      email: emailAdmin,
      senhaHash,
      papel: "ADMINISTRADOR",
      salaoId: salao.id,
    },
  });
  console.log(`Usuário admin pronto: ${admin.email}`);

  // MESTRE opcional — só cria se as duas variáveis forem passadas
  const emailMestre = process.env.SEED_MESTRE_EMAIL;
  const senhaMestre = process.env.SEED_MESTRE_SENHA;
  if (emailMestre && senhaMestre) {
    const hashMestre = await bcrypt.hash(senhaMestre, 12);
    const mestre = await prisma.usuario.upsert({
      where: { email: emailMestre },
      update: { senhaHash: hashMestre, papel: "MESTRE", salaoId: null },
      create: {
        nome: "Mestre",
        email: emailMestre,
        senhaHash: hashMestre,
        papel: "MESTRE",
        salaoId: null,
      },
    });
    console.log(`Usuário mestre pronto: ${mestre.email}`);
  }

  const servicos = [];
  for (const dados of SERVICOS) {
    servicos.push(await garantirServico(salao.id, dados));
  }
  console.log(`Catálogo de serviços pronto: ${servicos.length} serviços.`);

  const clientes = [];
  for (const dados of CLIENTES) {
    clientes.push(await garantirCliente(salao.id, dados));
  }
  console.log(`Clientes prontos: ${clientes.length} clientes.`);

  const profissionais = [];
  for (const dados of PROFISSIONAIS) {
    profissionais.push(await garantirProfissional(salao.id, dados));
  }
  console.log(`Profissionais prontos: ${profissionais.length} profissionais.`);

  const totalAgendamentos = await prisma.agendamento.count({ where: { salaoId: salao.id } });
  if (totalAgendamentos === 0) {
    for (let i = 0; i < PLANO_AGENDAMENTOS.length; i++) {
      const plano = PLANO_AGENDAMENTOS[i];
      const cliente = clientes[i % clientes.length];
      const servico = servicos[(i * 3) % servicos.length];
      const profissional = profissionais[i % profissionais.length];
      await prisma.agendamento.create({
        data: {
          salaoId: salao.id,
          clienteId: cliente.id,
          servicoId: servico.id,
          profissionalId: profissional.id,
          data: dataEm(plano.diasOffset, plano.hora),
          status: plano.status,
          observacoes: plano.observacoes || null,
        },
      });
    }
    console.log(`Agendamentos de exemplo criados: ${PLANO_AGENDAMENTOS.length}.`);
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
