# Banco de dados — Plataforma Style

> Fonte da verdade: [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma). Este
> documento é um mapa de leitura rápida — em caso de divergência, o schema manda.

PostgreSQL via Prisma. Todo modelo operacional carrega `salaoId` (índice + filtro obrigatório em
toda query) — é o limite de isolamento entre os salões assinantes da plataforma.

## Tabelas

| Modelo | Campos principais | Relaciona com |
|---|---|---|
| `Salao` | nome, slug (único), dominio (único), status, plano, categoria, template, cores/logo/banner, dados cadastrais, `personalizacao` (JSON livre), `deletadoEm` | tudo — é a raiz do tenant |
| `Usuario` | nome, email (único), senhaHash, papel (`ADMINISTRADOR`\|`MESTRE`), salaoId (null só pra `MESTRE`) | `MembroEquipe`, `LogAuditoria`, `TokenRedefinicaoSenha` |
| `MembroEquipe` | papel (`DONO`\|`GERENTE`\|`PROFISSIONAL`\|`RECEPCIONISTA`), profissionalId (opcional) | `Usuario` + `Salao`, único por (usuarioId, salaoId) |
| `Cliente` | nome, email, telefone, dataNascimento, vip, observacoes, `deletadoEm` | `Agendamento`; único por (salaoId, email) e (salaoId, telefone) |
| `Servico` | nome, descricao, precoCentavos, duracaoMinutos, ativo, `deletadoEm` | `Agendamento`, `ServicoProfissional`; único por (salaoId, nome) |
| `Profissional` | nome, urlFoto, especialidade, bio, ativo, `deletadoEm` | `HorarioTrabalho`, `Ausencia`, `Agendamento`, `ServicoProfissional`, `MembroEquipe`, `Comissao` |
| `ServicoProfissional` | — (tabela de junção) | liga `Servico` ↔ `Profissional`; sem vínculo nenhum = qualquer profissional pode realizar o serviço |
| `HorarioTrabalho` | diaSemana (0-6), minutoInicio, minutoFim | um `Profissional` pode ter mais de uma janela por dia (turno dividido) |
| `Ausencia` | dataInicio, dataFim, motivo | período de férias/folga — bloqueia a disponibilidade nesse intervalo |
| `Agendamento` | data, status (`AGENDADO`\|`CONFIRMADO`\|`EM_ATENDIMENTO`\|`CONCLUIDO`\|`CANCELADO`), observacoes, lembreteEnviadoEm, `deletadoEm` | `Cliente` (restrict), `Servico` (restrict), `Profissional` (restrict, opcional), `Pagamento` |
| `Pagamento` | valorCentavos, metodo (`DINHEIRO`\|`PIX`\|`CARTAO`), pagoEm | único por `Agendamento`; opcionalmente gera `Comissao` |
| `Comissao` | percentual, valorCentavos | ligada a `Profissional` + `Pagamento`; percentual congelado no momento do pagamento |
| `Plano` | chave (única — mesmo vocabulário de `START`/`PRO`/`PREMIUM`), nome, precoCentavos, limites (JSON) | `Assinatura` |
| `Assinatura` | status (`TESTE`\|`ATIVA`\|`ATRASADA`\|`CANCELADA`), gatewayProvedor, idGatewayExterno, inicioTeste, fimTeste, proximaCobranca | única por `Salao`; `Fatura` |
| `Fatura` | valorCentavos, status (`PENDENTE`\|`PAGA`\|`ATRASADA`\|`CANCELADA`), vencimento, pagaEm | ligada a `Assinatura` |
| `TokenRedefinicaoSenha` | token (hash, único), expiraEm, usadoEm | ligada a `Usuario` |
| `LogAuditoria` | acao, entidade, entidadeId, detalhes (JSON), ip | `Usuario` (opcional, SET NULL) + `Salao` (opcional, SET NULL) |

## Índices e chaves únicas que importam

- `Salao.slug`, `Salao.dominio` — únicos (o site público resolve o salão por qualquer um dos dois).
- `Cliente`: único por `(salaoId, email)` e `(salaoId, telefone)` — dois salões podem ter clientes
  com o mesmo e-mail; o mesmo salão, não.
- `Servico`: único por `(salaoId, nome)`.
- `MembroEquipe`: único por `(usuarioId, salaoId)` — uma pessoa só tem um papel por salão.
- Toda tabela filha de `Salao` tem índice em `salaoId` (e composto quando a query mais comum
  filtra por mais de um campo, ex. `HorarioTrabalho(profissionalId, diaSemana)`,
  `Cliente(salaoId, vip)`).

## `onDelete` — por que cada um é o que é

- `Cascade` na maioria (apagar o `Salao` apaga tudo dentro dele) — é o comportamento esperado de um
  tenant sendo removido. Na prática, hoje `excluirSalao` faz soft delete, então isso só valeria se
  alguém apagasse a linha direto no banco.
- `Restrict` em `Agendamento.clienteId`/`servicoId`/`profissionalId` — não deixa apagar um cliente,
  serviço ou profissional que tem agendamento associado, nem por acidente. É por isso que excluir
  esses três é soft delete (`deletadoEm`), não `DELETE` de verdade: o histórico precisa continuar
  existindo pro `Agendamento` continuar válido.
- `SetNull` em `LogAuditoria` (usuarioId/salaoId) e em `MembroEquipe.profissionalId` — perder a
  referência não deveria apagar o log/o vínculo em si, só a referência específica.

## Migrations

Cada mudança de schema é uma migration em `backend/prisma/migrations/<timestamp>_<nome>/migration.sql`
— SQL puro, gerado (normalmente) por `npx prisma migrate dev`. A migration mais recente
(`20260730120000_evolucao_saas_multiempresa`) foi **escrita à mão** seguindo o mesmo formato,
porque não havia banco de desenvolvimento acessível na sessão em que foi criada — ela não foi
aplicada em nenhum ambiente ainda. Revise antes de rodar (ver [Instalacao.md](Instalacao.md)).

Convenção do projeto: nomes de tabela/coluna em português (com exceções documentadas em comentário
no próprio `schema.prisma`, pra chaves que já podem estar salvas em produção com nome em inglês —
ex. `personalizacao.blockOrder`).
