# Arquitetura — Plataforma Style

> Complementa o [README](../README.md). Aqui ficam as decisões de arquitetura e o *porquê* delas,
> não só o *o quê*.

## Visão geral

Dois serviços independentes, comunicando só por HTTP/JSON:

```
frontend/  → SPA React (Vite), servida como estático pelo nginx do container `app`
backend/   → API Express + Prisma, container `api`
```

O `nginx` do container `app` faz proxy de `/api/*` pro container `api` (ver `frontend/nginx.conf`)
— do ponto de vista do navegador, tudo é a mesma origem, então não há CORS entre o site e a API em
produção (o `CORS_ORIGIN` do backend existe pro ambiente de desenvolvimento, onde o frontend roda
numa porta diferente via Vite).

## Camadas do backend

```
rotas/          → só roteamento HTTP + middleware (auth, permissão, rate limit)
controladores/  → valida entrada (Zod), decide o que consultar/gravar, monta a resposta
servicos/       → regra de negócio que cruza mais de um controlador (equipe, auditoria,
                   assinatura, cobrança, onboarding) — não fala HTTP, só recebe dados e devolve dados
biblioteca/     → funções puras e tabelas de referência (planos, permissões, paginação,
                   disponibilidade) — testáveis sem banco
middleware/     → autenticação, RBAC, resolução de salão, tratamento de erro
utilitarios/    → helpers pequenos e sem estado (jwt, senha, telefone)
```

Regra prática: se a lógica é usada por **mais de um** controlador (ex.: `resolverMembroEquipe` é
usado por login, `/auth/me` e pelo cadastro público), ela vai pra `servicos/`. Se é usada por **um
só** controlador, fica inline nele (é o padrão que o projeto já usava antes desta rodada, ex.
`garantirPertenceAoSalaoAtual` em `agendamentos.controlador.js`) — não extraímos prematuramente.

## Camadas do frontend

```
paginas/        → uma tela por rota (site público / administrativo / mestre)
componentes/ui/ → design system — sem estado de negócio, só apresentação
componentes/blocos/ → seções da landing exclusiva de um salão
contextos/      → estado global via React Context (autenticação, tema, notificações, salão atual)
ganchos/        → hooks reutilizáveis (ex.: usePermissao)
biblioteca/     → funções puras + o client HTTP único (api.js)
```

Todo `fetch` passa por `biblioteca/api.js` — não existe chamada de rede solta em nenhum componente.

## Multi-tenant

Isolamento **lógico**, não físico: uma tabela por entidade, sempre com `salaoId`, sempre filtrada
por ele. Dois middlewares resolvem "qual é o salão da requisição":

- `resolverSalaoPorParametro` — rotas públicas (`/api/public/:salaoId/...`), lê o `:salaoId` da URL
  (aceita slug ou id).
- `exigirSalao` — rotas autenticadas, lê `salaoId` **do JWT**, nunca de um parâmetro que o cliente
  manda. É isso que torna estruturalmente impossível um admin do Salão A editar dado do Salão B
  mudando um id na URL — o servidor nunca confia no que o cliente diz que é "o salão dele".

## RBAC — dois conceitos de papel, de propósito

- `Usuario.papel` (`ADMINISTRADOR` | `MESTRE`) — decide **em qual painel** a pessoa loga. Não mudou
  nesta rodada, pra não quebrar sessões/JWTs já emitidos.
- `MembroEquipe.papel` (`DONO` | `GERENTE` | `PROFISSIONAL` | `RECEPCIONISTA`) — decide **o que**
  essa pessoa pode fazer dentro do painel do salão. É resolvido no login e embutido no JWT
  (`papelEquipe`), pra `verificarPermissao()` não precisar consultar o banco a cada requisição.

Ver [Permissoes.md](Permissoes.md) para a matriz completa e como o escopo de dado (não só de tela)
é aplicado.

## Soft delete

`Salao`, `Cliente`, `Servico`, `Profissional` e `Agendamento` têm `deletadoEm`. "Excluir" nunca é
`DELETE` — é `UPDATE ... SET deletadoEm = now()`, e toda leitura filtra `deletadoEm: null`. Motivo:
um salão comercial não pode perder o histórico de faturamento de um cliente só porque alguém clicou
errado em "remover". A limitação conhecida: os índices únicos (`salaoId+email`, `salaoId+telefone`
em `Cliente`; `salaoId+nome` em `Servico`) não são parciais — um cliente/serviço "excluído" ainda
ocupa o slot único, então recriar com o mesmo e-mail/nome exige reativar o registro antigo (não há
endpoint pra isso ainda).

## Cobrança da plataforma (assinatura)

`Plano`/`Assinatura`/`Fatura` existem no banco e o fluxo de teste grátis (14 dias) já funciona de
ponta a ponta — o que falta é só a integração com um provedor de pagamento real. A peça pronta pra
isso é `backend/src/servicos/cobranca.servico.js`: define a interface (`criarSessaoCheckout`,
`cancelar`, `sincronizarStatus`) que qualquer gateway precisa implementar, com um adaptador
`"manual"` (o comportamento de hoje — Mestre edita a assinatura na mão) registrado por padrão.
Plugar Stripe/Mercado Pago/Pagar.me é implementar um adaptador novo com essa mesma interface e
apontar `GATEWAY_COBRANCA` pra ele — nenhum controlador precisa mudar.

## Decisões que ficaram de fora de propósito

- **Sem service mesh/microsserviços.** Um monólito Express + um SPA React é o tamanho certo pro
  volume de dado e de equipe atual — separar em serviços agora seria complexidade sem benefício.
- **Sem fila/mensageria** pro job de lembrete do WhatsApp (`setInterval` em processo). Funciona
  enquanto a API rodar numa réplica só; escalar horizontalmente exige migrar pra uma fila com lock
  (BullMQ/pg-boss) — não fizemos isso preventivamente porque hoje não há necessidade de múltiplas
  réplicas.
- **Sem camada de cache** (Redis) — o volume de leitura atual não justifica a complexidade
  operacional extra.
