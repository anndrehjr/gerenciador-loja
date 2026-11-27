// Seed demonstrativo — popula o banco com empresas/clientes/agenda/
// financeiro/estoque fictícios, mas estatisticamente plausíveis (ver
// geradores.js/perfis.js). Roda separado do prisma/seed.js (que cuida do
// único salão de exemplo "de verdade" do projeto) — este aqui é pensado
// pra gerar dezenas de tenants completos de uma vez, pra demonstração
// comercial.
//
// Uso:
//   npm run seed:demo                       — usa os padrões abaixo
//   DEMO_EMPRESAS=50 npm run seed:demo       — escala pro volume máximo pedido
//   npm run seed:demo -- --reset             — apaga só os dados demonstrativos
//
// Isolamento: todo salão criado aqui tem slug "demo-..." e
// observacoes="SEED_DEMONSTRATIVO" — nunca sobrescreve/mistura com salão
// real, e dá pra identificar e apagar com segurança (--reset faz isso).
import "dotenv/config";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { gerarHashSenha } from "../../src/utilitarios/senha.js";
import {
  definirSemente,
  aleatorio,
  inteiroEntre,
  escolher,
  escolherPonderado,
  embaralhar,
  ruidoGaussiano,
  pesoDiaSemana,
  pesoMes,
  minutoDoDia,
  combinarData,
  gerarCnpjFalso,
  gerarTelefoneFalso,
  normalizarParaSlug,
} from "./geradores.js";
import {
  sortearPerfilCliente,
  sortearStatusPassado,
  sortearStatusFuturo,
  sortearMetodoPagamento,
  sortearPorteEmpresa,
  sortearPopularidadeProfissional,
} from "./perfis.js";
import {
  NOMES_FEMININOS,
  NOMES_MASCULINOS,
  SOBRENOMES,
  CIDADES,
  SERVICOS_POR_CATEGORIA,
  ESPECIALIDADES_POR_CATEGORIA,
  CATEGORIAS_PRODUTO,
  NOMES_PRODUTO_POR_CATEGORIA,
} from "./dados-brasileiros.js";
import { gerarNomeEmpresa } from "./nomes-empresa.js";

const prisma = new PrismaClient();

const CONFIG = {
  empresas: Number(process.env.DEMO_EMPRESAS) || 20,
  meses: Number(process.env.DEMO_MESES) || 24,
  semente: Number(process.env.DEMO_SEMENTE) || Date.now(),
  lote: Number(process.env.DEMO_LOTE) || 2000,
};

const CATEGORIAS_SALAO = ["FEMININO", "BARBEARIA", "UNISSEX", "ESTETICA", "OUTROS"];

const IPS_FALSOS = ["187.94.12.", "201.23.45.", "179.108.77.", "138.204.9.", "191.7.30."];
const AGENTES_FALSOS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15",
  "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/124.0",
];
const ACOES_AUDITORIA = [
  { acao: "login.sucesso", entidade: "Usuario" },
  { acao: "cliente.criar", entidade: "Cliente" },
  { acao: "cliente.editar", entidade: "Cliente" },
  { acao: "agendamento.criar", entidade: "Agendamento" },
  { acao: "agendamento.status", entidade: "Agendamento" },
  { acao: "servico.editar", entidade: "Servico" },
  { acao: "pagamento.registrar", entidade: "Pagamento" },
];
const OBSERVACOES_CLIENTE = [
  "Prefere atendimento pela manhã.",
  "Confirmar produto antes de usar — sensibilidade na pele.",
  "Cliente indicou amigos para o salão.",
  "Gosta de conversar durante o atendimento.",
  "Prefere contato só por WhatsApp.",
  null,
  null,
  null,
];

// ---------- helpers de data/dinheiro/id ----------

function gerarId() {
  return crypto.randomUUID();
}

function somarDias(data, dias) {
  const d = new Date(data);
  d.setDate(d.getDate() + dias);
  return d;
}

function subtrairDias(data, dias) {
  return somarDias(data, -dias);
}

function somarMeses(data, meses) {
  const d = new Date(data);
  d.setMonth(d.getMonth() + meses);
  return d;
}

function subtrairMeses(data, meses) {
  return somarMeses(data, -meses);
}

function diferencaDias(a, b) {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

function formatarMoeda(centavos) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Avatar determinístico (pravatar.cc é um serviço público de avatar
// fictício, comum em ambientes de teste — nunca é a foto de uma pessoa
// real, só um retrato gerado a partir da semente).
function urlAvatar(semente) {
  return `https://i.pravatar.cc/300?u=${semente}`;
}

function gerarNomePessoa(sexo) {
  const primeiro = sexo === "F" ? escolher(NOMES_FEMININOS) : escolher(NOMES_MASCULINOS);
  return `${primeiro} ${escolher(SOBRENOMES)} ${escolher(SOBRENOMES)}`;
}

function gerarEmailFicticio(nome, slug, sufixo = "") {
  const local = normalizarParaSlug(nome).replace(/-/g, ".");
  return `${local}${sufixo}@${slug}.demo.local`;
}

async function inserirEmLotes(modelo, linhas, opcoes = {}) {
  for (let i = 0; i < linhas.length; i += CONFIG.lote) {
    await prisma[modelo].createMany({ data: linhas.slice(i, i + CONFIG.lote), ...opcoes });
  }
}

async function garantirPlanos() {
  const info = { START: "Start", PRO: "Pro", PREMIUM: "Premium" };
  const planos = {};
  for (const chave of Object.keys(info)) {
    planos[chave] = await prisma.plano.upsert({
      where: { chave },
      update: {},
      create: { chave, nome: info[chave], precoCentavos: 0 },
    });
  }
  return planos;
}

// ---------- uma empresa completa ----------

async function criarEmpresa(indice, ctx) {
  const { planos, usadosNomes, senhaHashDemo, agora, contadores } = ctx;

  const porte = sortearPorteEmpresa();
  const categoria = escolher(CATEGORIAS_SALAO);
  const nomeEmpresa = gerarNomeEmpresa(categoria, usadosNomes);
  const { cidade, estado } = escolher(CIDADES);
  // Inclui a semente da execução no slug — sem isso, duas rodadas do seed
  // (cada uma reiniciando o índice em 0) podiam colidir se sorteassem o
  // mesmo nome de empresa no mesmo índice, quebrando o unique de Salao.slug.
  const slug = `demo-${normalizarParaSlug(nomeEmpresa)}-${indice + 1}-${CONFIG.semente.toString(36).slice(-5)}`;

  const mesesDeVida = inteiroEntre(1, Math.max(CONFIG.meses - 2, 1));
  const criadoEmEmpresa = subtrairMeses(agora, mesesDeVida);
  const emTeste = mesesDeVida <= 1 && aleatorio() < 0.4;

  const sexoDono = escolher(["F", "M"]);
  const nomeDono = gerarNomePessoa(sexoDono);
  const emailDono = gerarEmailFicticio(nomeDono, slug);

  const salao = await prisma.salao.create({
    data: {
      nome: nomeEmpresa,
      slug,
      categoria,
      plano: porte.plano,
      status: "ATIVO",
      cidade,
      estado,
      endereco: `Rua ${escolher(SOBRENOMES)}, ${inteiroEntre(10, 2000)} - Centro`,
      cep: `${inteiroEntre(10000, 99999)}-${inteiroEntre(100, 999)}`,
      documento: gerarCnpjFalso(),
      razaoSocial: `${nomeEmpresa} LTDA`,
      nomeFantasia: nomeEmpresa,
      nomeProprietario: nomeDono,
      telefoneProprietario: gerarTelefoneFalso(),
      whatsappProprietario: gerarTelefoneFalso(),
      emailProprietario: emailDono,
      statusContrato: emTeste ? "TESTE" : "ATIVO",
      observacoes: "SEED_DEMONSTRATIVO — gerado automaticamente, seguro para excluir via --reset.",
      criadoEm: criadoEmEmpresa,
    },
  });
  contadores.empresas++;

  await prisma.assinatura.create({
    data: {
      salaoId: salao.id,
      planoId: planos[porte.plano].id,
      status: emTeste ? "TESTE" : "ATIVA",
      inicioTeste: emTeste ? criadoEmEmpresa : null,
      fimTeste: emTeste ? somarDias(criadoEmEmpresa, 14) : null,
      proximaCobranca: emTeste ? somarDias(criadoEmEmpresa, 14) : somarDias(agora, inteiroEntre(1, 28)),
      criadoEm: criadoEmEmpresa,
    },
  });

  // ---------- Equipe ----------
  const usuarioDono = await prisma.usuario.create({
    data: {
      nome: nomeDono,
      email: emailDono,
      senhaHash: senhaHashDemo,
      papel: "ADMINISTRADOR",
      salaoId: salao.id,
      criadoEm: criadoEmEmpresa,
    },
  });
  await prisma.membroEquipe.create({
    data: { usuarioId: usuarioDono.id, salaoId: salao.id, papel: "DONO", criadoEm: criadoEmEmpresa },
  });
  contadores.usuarios++;

  const totalColaboradores = inteiroEntre(porte.usuarios[0], porte.usuarios[1]);
  const profissionais = [];

  for (let i = 0; i < totalColaboradores - 1; i++) {
    const papel = escolherPonderado([
      { valor: "GERENTE", peso: 10 },
      { valor: "RECEPCIONISTA", peso: 25 },
      { valor: "PROFISSIONAL", peso: 65 },
    ]);
    const sexo = escolher(["F", "M"]);
    const nomePessoa = gerarNomePessoa(sexo);
    const emailPessoa = gerarEmailFicticio(nomePessoa, slug, i);
    const criadoEmPessoa = somarDias(criadoEmEmpresa, inteiroEntre(0, 60));

    const usuario = await prisma.usuario.create({
      data: {
        nome: nomePessoa,
        email: emailPessoa,
        senhaHash: senhaHashDemo,
        papel: "ADMINISTRADOR",
        salaoId: salao.id,
        criadoEm: criadoEmPessoa,
      },
    });
    contadores.usuarios++;

    let profissionalId = null;
    if (papel === "PROFISSIONAL") {
      const profissional = await prisma.profissional.create({
        data: {
          nome: nomePessoa,
          urlFoto: urlAvatar(usuario.id),
          especialidade: escolher(ESPECIALIDADES_POR_CATEGORIA[categoria]),
          bio: `Profissional com experiência em ${escolher(ESPECIALIDADES_POR_CATEGORIA[categoria]).toLowerCase()}.`,
          ativo: true,
          salaoId: salao.id,
          criadoEm: criadoEmPessoa,
        },
      });
      contadores.profissionais++;
      profissionalId = profissional.id;

      const diasTrabalhados = embaralhar([1, 2, 3, 4, 5, 6]).slice(0, inteiroEntre(5, 6));
      await prisma.horarioTrabalho.createMany({
        data: diasTrabalhados.map((dia) => ({
          diaSemana: dia,
          minutoInicio: 9 * 60,
          minutoFim: 18 * 60,
          profissionalId: profissional.id,
          salaoId: salao.id,
          atualizadoEm: agora,
        })),
      });

      profissionais.push({
        id: profissional.id,
        popularidade: sortearPopularidadeProfissional(),
        servicosIds: [],
      });
    }

    await prisma.membroEquipe.create({
      data: { usuarioId: usuario.id, salaoId: salao.id, papel, profissionalId, criadoEm: criadoEmPessoa },
    });
  }

  if (profissionais.length === 0) {
    const profissional = await prisma.profissional.create({
      data: {
        nome: nomeDono,
        urlFoto: urlAvatar(usuarioDono.id),
        especialidade: escolher(ESPECIALIDADES_POR_CATEGORIA[categoria]),
        ativo: true,
        salaoId: salao.id,
        criadoEm: criadoEmEmpresa,
      },
    });
    contadores.profissionais++;
    await prisma.horarioTrabalho.createMany({
      data: [1, 2, 3, 4, 5].map((dia) => ({
        diaSemana: dia,
        minutoInicio: 9 * 60,
        minutoFim: 18 * 60,
        profissionalId: profissional.id,
        salaoId: salao.id,
        atualizadoEm: agora,
      })),
    });
    profissionais.push({ id: profissional.id, popularidade: 1, servicosIds: [] });
  }

  // ---------- Serviços ----------
  const catalogoBase = SERVICOS_POR_CATEGORIA[categoria] || SERVICOS_POR_CATEGORIA.OUTROS;
  const servicos = [];
  for (const item of catalogoBase) {
    const servico = await prisma.servico.create({
      data: {
        nome: item.nome,
        precoCentavos: item.precoCentavos,
        duracaoMinutos: item.duracaoMinutos,
        ativo: true,
        salaoId: salao.id,
        criadoEm: criadoEmEmpresa,
      },
    });
    contadores.servicos++;
    servicos.push({ id: servico.id, precoCentavos: item.precoCentavos });

    if (aleatorio() < 0.4 && profissionais.length > 1) {
      const vinculados = embaralhar(profissionais).slice(0, inteiroEntre(1, Math.min(2, profissionais.length)));
      await prisma.servicoProfissional.createMany({
        data: vinculados.map((p) => ({ servicoId: servico.id, profissionalId: p.id, salaoId: salao.id })),
      });
      for (const v of vinculados) profissionais.find((p) => p.id === v.id).servicosIds.push(servico.id);
    }
  }
  for (const p of profissionais) {
    if (p.servicosIds.length === 0) p.servicosIds = servicos.map((s) => s.id);
  }

  // ---------- Clientes + agenda (o núcleo do volume) ----------
  const totalClientes = inteiroEntre(porte.clientes[0], porte.clientes[1]);
  const janelaInicio = subtrairMeses(agora, CONFIG.meses);

  const linhasCliente = [];
  const linhasAgendamento = [];
  const linhasPagamento = [];
  const linhasComissao = [];

  for (let i = 0; i < totalClientes; i++) {
    const sexo = escolher(["F", "M"]);
    const nomeCliente = gerarNomePessoa(sexo);
    const idade = inteiroEntre(16, 75);
    const dataNascimento = new Date(agora.getFullYear() - idade, inteiroEntre(0, 11), inteiroEntre(1, 28));

    const perfil = sortearPerfilCliente();
    // clientes "novos" concentram o cadastro perto de hoje (viés quadrático).
    const offsetDias = Math.floor((1 - Math.pow(aleatorio(), 2)) * (CONFIG.meses * 30));
    const dataCadastroBruta = subtrairDias(agora, offsetDias);
    const dataCadastro = dataCadastroBruta < janelaInicio ? janelaInicio : dataCadastroBruta;

    const clienteId = gerarId();
    const vip = aleatorio() < 0.08;
    const temEmail = aleatorio() < 0.85;
    const profissionalFavoritoId = escolherPonderado(
      profissionais.map((p) => ({ valor: p.id, peso: p.popularidade }))
    );

    linhasCliente.push({
      id: clienteId,
      nome: nomeCliente,
      urlFoto: urlAvatar(clienteId),
      email: temEmail
        ? `${normalizarParaSlug(nomeCliente).replace(/-/g, ".")}${i}@${escolher(["gmail.com", "hotmail.com", "outlook.com", "yahoo.com.br"])}`
        : null,
      telefone: gerarTelefoneFalso(),
      dataNascimento,
      vip,
      observacoes: escolher(OBSERVACOES_CLIENTE),
      profissionalFavoritoId,
      salaoId: salao.id,
      criadoEm: dataCadastro,
      atualizadoEm: agora,
    });
    contadores.clientes++;

    // ---- histórico de agenda desse cliente, guiado pelo perfil ----
    const vaiSumir = aleatorio() < perfil.chanceSumico;
    const inicioSumico = vaiSumir ? inteiroEntre(30, Math.max(CONFIG.meses * 15, 60)) : null;
    const duracaoSumico = vaiSumir ? inteiroEntre(20, Math.max(CONFIG.meses * 8, 40)) : null;

    let cursor = new Date(dataCadastro);
    while (cursor < agora) {
      const intervalo = Math.max(3, Math.round(perfil.intervaloDias * (1 + ruidoGaussiano(perfil.variacao))));
      cursor = somarDias(cursor, intervalo);
      if (cursor >= agora) break;

      if (vaiSumir) {
        const diasDesdeCadastro = diferencaDias(cursor, dataCadastro);
        if (diasDesdeCadastro >= inicioSumico && diasDesdeCadastro < inicioSumico + duracaoSumico) continue;
      }

      // "buracos" naturais: nem todo slot ideal vira visita de verdade.
      if (aleatorio() > pesoDiaSemana(cursor) * pesoMes(cursor) * 0.9) continue;

      const servico = escolher(servicos);
      const candidatos = profissionais.filter((p) => p.servicosIds.includes(servico.id));
      const profissional = escolherPonderado(
        (candidatos.length ? candidatos : profissionais).map((p) => ({ valor: p, peso: p.popularidade }))
      );

      const dataHora = combinarData(cursor, minutoDoDia());
      const agendamentoId = gerarId();
      const status = sortearStatusPassado();

      linhasAgendamento.push({
        id: agendamentoId,
        data: dataHora,
        status,
        clienteId,
        servicoId: servico.id,
        profissionalId: profissional.id,
        salaoId: salao.id,
        criadoEm: dataHora,
        atualizadoEm: dataHora,
      });
      contadores.agendamentos++;

      if (status === "CONCLUIDO") {
        const valorPago = Math.max(500, Math.round(servico.precoCentavos * (1 + ruidoGaussiano(0.06))));
        const pagamentoId = gerarId();
        linhasPagamento.push({
          id: pagamentoId,
          agendamentoId,
          valorCentavos: valorPago,
          metodo: sortearMetodoPagamento(),
          pagoEm: dataHora,
          salaoId: salao.id,
        });
        contadores.pagamentos++;

        if (aleatorio() < 0.7) {
          const percentual = escolher([20, 25, 30, 35, 40]);
          linhasComissao.push({
            id: gerarId(),
            profissionalId: profissional.id,
            pagamentoId,
            percentual,
            valorCentavos: Math.round((valorPago * percentual) / 100),
            salaoId: salao.id,
          });
          contadores.comissoes++;
        }
      }
    }

    // agendamentos futuros — pra Painel/Agenda nunca abrirem sem "próximos".
    if (aleatorio() < 0.55) {
      for (let f = 0; f < inteiroEntre(1, 2); f++) {
        const dia = somarDias(agora, inteiroEntre(1, 21));
        const servico = escolher(servicos);
        const candidatos = profissionais.filter((p) => p.servicosIds.includes(servico.id));
        const profissional = escolherPonderado(
          (candidatos.length ? candidatos : profissionais).map((p) => ({ valor: p, peso: p.popularidade }))
        );
        linhasAgendamento.push({
          id: gerarId(),
          data: combinarData(dia, minutoDoDia()),
          status: sortearStatusFuturo(),
          clienteId,
          servicoId: servico.id,
          profissionalId: profissional.id,
          salaoId: salao.id,
          criadoEm: agora,
          atualizadoEm: agora,
        });
        contadores.agendamentos++;
      }
    }
  }

  // ---------- Financeiro: despesas ----------
  const valorAluguelBase = { pequeno: 150000, medio: 350000, grande: 700000 }[porte.chave];
  const linhasDespesa = [];
  let cursorMes = new Date(janelaInicio);
  while (cursorMes < agora) {
    const fatorSazonal = pesoMes(cursorMes);
    linhasDespesa.push({
      id: gerarId(), descricao: "Aluguel do espaço", categoria: "ALUGUEL",
      valorCentavos: Math.round(valorAluguelBase * (1 + ruidoGaussiano(0.02))),
      data: new Date(cursorMes), salaoId: salao.id,
    });
    linhasDespesa.push({
      id: gerarId(), descricao: "Folha de pagamento", categoria: "FOLHA_PAGAMENTO",
      valorCentavos: Math.round(totalColaboradores * 160000 * (1 + ruidoGaussiano(0.05))),
      data: new Date(cursorMes), salaoId: salao.id,
    });
    if (aleatorio() < 0.7) {
      linhasDespesa.push({
        id: gerarId(),
        descricao: escolher(["Compra de produtos para revenda", "Reposição de insumos"]),
        categoria: "PRODUTOS",
        valorCentavos: Math.round(inteiroEntre(50000, 400000) * fatorSazonal),
        data: somarDias(cursorMes, inteiroEntre(1, 25)),
        salaoId: salao.id,
      });
    }
    if (aleatorio() < 0.4) {
      linhasDespesa.push({
        id: gerarId(),
        descricao: escolher(["Anúncios em redes sociais", "Impulsionamento de posts", "Panfletagem"]),
        categoria: "MARKETING",
        valorCentavos: inteiroEntre(15000, 150000),
        data: somarDias(cursorMes, inteiroEntre(1, 25)),
        salaoId: salao.id,
      });
    }
    if (aleatorio() < 0.25) {
      linhasDespesa.push({
        id: gerarId(),
        descricao: escolher(["Manutenção de equipamentos", "Reparo elétrico", "Pintura e reforma"]),
        categoria: "MANUTENCAO",
        valorCentavos: inteiroEntre(10000, 200000),
        data: somarDias(cursorMes, inteiroEntre(1, 25)),
        salaoId: salao.id,
      });
    }
    cursorMes = somarMeses(cursorMes, 1);
  }
  contadores.despesas += linhasDespesa.length;

  // ---------- Estoque ----------
  const categoriasEscolhidas = embaralhar(CATEGORIAS_PRODUTO).slice(0, inteiroEntre(3, 5));
  const linhasCategoriaProduto = categoriasEscolhidas.map((nome) => ({ id: gerarId(), nome, salaoId: salao.id }));
  const mapaCategoriaId = new Map(linhasCategoriaProduto.map((c) => [c.nome, c.id]));

  const linhasProduto = [];
  const linhasMovimentacao = [];
  for (const nomeCategoria of categoriasEscolhidas) {
    for (const nomeProduto of NOMES_PRODUTO_POR_CATEGORIA[nomeCategoria] || []) {
      const produtoId = gerarId();
      const estoqueMinimo = inteiroEntre(5, 15);
      const abaixoDoMinimo = aleatorio() < 0.15;
      const estoqueAtual = abaixoDoMinimo
        ? inteiroEntre(0, Math.max(estoqueMinimo - 1, 0))
        : inteiroEntre(estoqueMinimo + 5, estoqueMinimo + 60);
      const vencido = aleatorio() < 0.08;

      linhasProduto.push({
        id: produtoId,
        nome: nomeProduto,
        precoCentavos: inteiroEntre(2000, 15000),
        estoqueAtual,
        estoqueMinimo,
        validade: vencido ? subtrairDias(agora, inteiroEntre(1, 90)) : somarDias(agora, inteiroEntre(60, 400)),
        ativo: true,
        categoriaId: mapaCategoriaId.get(nomeCategoria),
        salaoId: salao.id,
        criadoEm: criadoEmEmpresa,
        atualizadoEm: agora,
      });
      contadores.produtos++;

      let cursorMov = new Date(criadoEmEmpresa);
      while (cursorMov < agora) {
        cursorMov = somarDias(cursorMov, inteiroEntre(10, 30));
        if (cursorMov >= agora) break;
        const tipo = aleatorio() < 0.4 ? "ENTRADA" : "SAIDA";
        linhasMovimentacao.push({
          id: gerarId(),
          tipo,
          quantidade: tipo === "ENTRADA" ? inteiroEntre(10, 50) : inteiroEntre(1, 8),
          motivo: tipo === "ENTRADA" ? "Reposição de estoque" : "Venda / uso em atendimento",
          produtoId,
          salaoId: salao.id,
          criadoEm: new Date(cursorMov),
        });
        contadores.movimentacoesEstoque++;
      }
    }
  }

  // ---------- Lista de espera ----------
  const linhasListaEspera = embaralhar(linhasCliente)
    .slice(0, inteiroEntre(0, 8))
    .map((c) => ({
      id: gerarId(),
      clienteId: c.id,
      servicoId: escolher(servicos).id,
      profissionalId: aleatorio() < 0.5 ? escolher(profissionais).id : null,
      atendida: aleatorio() < 0.3,
      salaoId: salao.id,
      criadoEm: subtrairDias(agora, inteiroEntre(0, 10)),
    }));
  contadores.listaEspera += linhasListaEspera.length;

  // ---------- Notificações (derivadas do que foi gerado de verdade) ----------
  const linhasNotificacao = [];
  for (const c of linhasCliente) {
    const aniversario = new Date(agora.getFullYear(), c.dataNascimento.getMonth(), c.dataNascimento.getDate());
    const diff = diferencaDias(aniversario, agora);
    if (diff >= 0 && diff <= 7) {
      linhasNotificacao.push({
        id: gerarId(), tipo: "ANIVERSARIANTE", titulo: "Cliente aniversariante",
        mensagem: `${c.nome} faz aniversário em ${aniversario.toLocaleDateString("pt-BR")}.`,
        lida: aleatorio() < 0.5, criadoEm: subtrairDias(agora, inteiroEntre(0, 3)), salaoId: salao.id,
      });
    }
  }
  for (const p of embaralhar(linhasPagamento.filter((p) => diferencaDias(agora, p.pagoEm) <= 14)).slice(0, 15)) {
    linhasNotificacao.push({
      id: gerarId(), tipo: "PAGAMENTO_RECEBIDO", titulo: "Pagamento recebido",
      mensagem: `Pagamento de ${formatarMoeda(p.valorCentavos)} confirmado.`,
      lida: aleatorio() < 0.6, criadoEm: p.pagoEm, salaoId: salao.id,
    });
  }
  const cancelamentos = linhasAgendamento.filter(
    (a) => a.status === "CANCELADO" && a.data <= agora && diferencaDias(agora, a.data) <= 14
  );
  for (const a of embaralhar(cancelamentos).slice(0, 10)) {
    linhasNotificacao.push({
      id: gerarId(), tipo: "AGENDAMENTO_CANCELADO", titulo: "Agendamento cancelado",
      mensagem: "Um cliente cancelou o agendamento.", lida: aleatorio() < 0.4, criadoEm: a.data, salaoId: salao.id,
    });
  }
  for (const p of linhasProduto.filter((p) => p.estoqueAtual < p.estoqueMinimo)) {
    linhasNotificacao.push({
      id: gerarId(), tipo: "ESTOQUE_BAIXO", titulo: "Estoque baixo",
      mensagem: `${p.nome} está com estoque abaixo do mínimo.`,
      lida: false, criadoEm: subtrairDias(agora, inteiroEntre(0, 5)), salaoId: salao.id,
    });
  }
  for (const c of embaralhar(linhasComissao).slice(0, 10)) {
    linhasNotificacao.push({
      id: gerarId(), tipo: "COMISSAO_LIBERADA", titulo: "Comissão liberada",
      mensagem: `Comissão de ${formatarMoeda(c.valorCentavos)} liberada.`,
      lida: aleatorio() < 0.5, criadoEm: subtrairDias(agora, inteiroEntre(0, 10)), salaoId: salao.id,
    });
  }
  if (emTeste) {
    linhasNotificacao.push({
      id: gerarId(), tipo: "ASSINATURA_VENCENDO", titulo: "Teste grátis acabando",
      mensagem: "Seu período de teste termina em breve.", lida: false, criadoEm: agora, salaoId: salao.id,
    });
  }
  contadores.notificacoes += linhasNotificacao.length;

  // ---------- Auditoria ----------
  const linhasAuditoria = [];
  const totalLogs = inteiroEntre(80, 300);
  for (let i = 0; i < totalLogs; i++) {
    const acao = escolher(ACOES_AUDITORIA);
    linhasAuditoria.push({
      id: gerarId(),
      usuarioId: usuarioDono.id,
      salaoId: salao.id,
      acao: acao.acao,
      entidade: acao.entidade,
      ip: `${escolher(IPS_FALSOS)}${inteiroEntre(1, 254)}`,
      userAgent: escolher(AGENTES_FALSOS),
      criadoEm: somarDias(criadoEmEmpresa, inteiroEntre(0, Math.max(diferencaDias(agora, criadoEmEmpresa), 1))),
    });
  }
  contadores.logs += linhasAuditoria.length;

  // ---------- Grava tudo, respeitando ordem de FK ----------
  await inserirEmLotes("categoriaProduto", linhasCategoriaProduto);
  await inserirEmLotes("cliente", linhasCliente, { skipDuplicates: true });
  await inserirEmLotes("agendamento", linhasAgendamento);
  await inserirEmLotes("pagamento", linhasPagamento);
  await inserirEmLotes("comissao", linhasComissao);
  await inserirEmLotes("despesa", linhasDespesa);
  await inserirEmLotes("produto", linhasProduto, { skipDuplicates: true });
  await inserirEmLotes("movimentacaoEstoque", linhasMovimentacao);
  await inserirEmLotes("listaEspera", linhasListaEspera);
  await inserirEmLotes("notificacao", linhasNotificacao);
  await inserirEmLotes("logAuditoria", linhasAuditoria);

  return { nome: nomeEmpresa, clientes: linhasCliente.length, agendamentos: linhasAgendamento.length };
}

// ---------- reset (isolamento) ----------

async function resetarDemo() {
  const saloes = await prisma.salao.findMany({ where: { slug: { startsWith: "demo-" } }, select: { id: true, nome: true } });
  if (saloes.length === 0) {
    console.log("Nenhum salão demonstrativo encontrado — nada para apagar.");
    return;
  }
  console.log(`Apagando ${saloes.length} empresas demonstrativas (cascade cuida do resto)...`);
  await prisma.salao.deleteMany({ where: { id: { in: saloes.map((s) => s.id) } } });
  console.log("Feito.");
}

// ---------- main ----------

async function main() {
  if (process.argv.includes("--reset")) {
    await resetarDemo();
    return;
  }

  if (process.env.NODE_ENV === "production" && !process.argv.includes("--confirmar-producao")) {
    throw new Error(
      "NODE_ENV=production e --confirmar-producao não foi passado — recuso rodar o seed demonstrativo " +
        "direto em produção sem essa confirmação explícita. Rode com --confirmar-producao se é isso mesmo que você quer."
    );
  }

  definirSemente(CONFIG.semente);
  console.log(
    `Seed demonstrativo — ${CONFIG.empresas} empresas, ${CONFIG.meses} meses de histórico, semente ${CONFIG.semente}, lote ${CONFIG.lote}`
  );

  const planos = await garantirPlanos();
  const usadosNomes = new Set();
  const senhaHashDemo = await gerarHashSenha("Demo@12345");
  const agora = new Date();

  const contadores = {
    empresas: 0, usuarios: 0, profissionais: 0, servicos: 0, clientes: 0,
    agendamentos: 0, pagamentos: 0, comissoes: 0, despesas: 0, produtos: 0,
    movimentacoesEstoque: 0, notificacoes: 0, logs: 0, listaEspera: 0,
  };

  for (let i = 0; i < CONFIG.empresas; i++) {
    const resultado = await criarEmpresa(i, { planos, usadosNomes, senhaHashDemo, agora, contadores });
    console.log(
      `  [${i + 1}/${CONFIG.empresas}] ${resultado.nome} — ${resultado.clientes} clientes, ${resultado.agendamentos} agendamentos`
    );
  }

  console.log("\nResumo final:");
  console.table(contadores);
  console.log(`\nLogin de teste em qualquer empresa demonstrativa: senha "Demo@12345" para todo usuário gerado.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
