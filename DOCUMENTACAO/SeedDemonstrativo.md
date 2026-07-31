# Seed demonstrativo — `npm run seed:demo`

> Popula o banco com dezenas de empresas fictícias completas (equipe,
> clientes, agenda de até 24 meses, financeiro, estoque, notificações,
> auditoria), pensado pra demonstração comercial: qualquer tela que se abra
> já mostra dado real, sem gráfico vazio.

## Como rodar

```bash
cd backend
npm run seed:demo
```

Usa os padrões: 20 empresas, 24 meses de histórico, lote de 2000 registros
por `createMany`. Todo usuário criado usa a senha **`Demo@12345`** (o
e-mail de cada um aparece no log da execução, no formato
`nome.sobrenome@demo-slug-da-empresa.demo.local`).

## Escalando pro volume máximo pedido

```bash
DEMO_EMPRESAS=50 DEMO_MESES=24 npm run seed:demo
```

| Variável | Padrão | Efeito |
|---|---|---|
| `DEMO_EMPRESAS` | 20 | Quantidade de empresas (o pedido original cobre 20–50) |
| `DEMO_MESES` | 24 | Meses de histórico de agenda/financeiro/estoque |
| `DEMO_SEMENTE` | `Date.now()` | Fixe pra reproduzir exatamente o mesmo banco entre execuções |
| `DEMO_LOTE` | 2000 | Tamanho de cada `createMany` — ajuste pra baixo se o Postgres reclamar de payload grande |

Com `DEMO_EMPRESAS=50` (porte "grande" upado até 2000 clientes cada), a
geração produz algo perto de **1,3–1,5 milhão de agendamentos** — não é um
número fixo no código, é o resultado natural dos perfis de frequência de
cliente (ver `prisma/seed-demo/perfis.js`) rodando por 24 meses. Confirmado
por simulação isolada (sem banco) antes de fechar o script — ver seção
"O que foi validado e o que não foi" abaixo.

## Isolamento (nunca mistura com dado real)

Toda empresa criada pelo seed:

- tem `slug` começando com `demo-`;
- tem `observacoes = "SEED_DEMONSTRATIVO — gerado automaticamente, seguro para excluir via --reset."`.

Isso é o que permite apagar só o conteúdo demonstrativo sem tocar em nenhum
salão real:

```bash
npm run seed:demo -- --reset
```

Apaga todo `Salao` com slug `demo-*` — o `onDelete: Cascade` do schema cuida
do resto (clientes, agenda, financeiro, estoque, notificações, auditoria
somem junto).

## Proteção contra rodar sem querer em produção

```js
if (process.env.NODE_ENV === "production" && !process.argv.includes("--confirmar-producao")) {
  throw new Error(...)
}
```

Se `NODE_ENV=production` (é o que o container `api` usa), o script recusa
rodar a menos que você passe `--confirmar-producao` explicitamente — evita
popular o banco real de clientes pagantes com dado fictício por engano.

## O que foi validado e o que não foi

**Validado nesta sessão** (sem banco de dados disponível no ambiente):
- `npx prisma validate` e `npx prisma generate` — schema novo é sintaticamente
  correto e bate com o client gerado.
- `node --check` em todos os arquivos do seed — sem erro de sintaxe.
- 19 testes unitários (`geradores.test.js`, `perfis.test.js`) cobrindo cada
  função estatística pura: determinismo da semente, limites de faixa,
  distribuição de pesos, ausência de loop infinito.
- **Simulação isolada da lógica de geração de agenda** (3.000 clientes, sem
  Prisma) — confirmou: nenhum loop passa de 85 iterações (limite de
  segurança do script real é 100.000), distribuição de status bate com os
  pesos configurados (82% concluído / 11% cancelado / 7% falta), e a
  extrapolação pro volume máximo pedido bate com a ordem de grandeza
  solicitada (~1,3M de ~1,5M agendamentos).

**Não validado** (precisa de um banco Postgres real, indisponível neste
ambiente):
- Que as ~15 chamadas `prisma.X.create/createMany` por empresa realmente
  gravam sem erro de constraint/FK contra um banco de verdade.
- Tempo de execução real contra banco (a simulação só mede o custo de
  gerar os dados em memória, não o custo de rede/disco do Postgres).
- Se `skipDuplicates` cobre todos os casos de colisão de unicidade na
  prática (a chance teórica é baixíssima, mas só um banco real confirma).

**Recomendação:** rodar `npm run seed:demo` primeiro num ambiente de
teste/staging com poucas empresas (`DEMO_EMPRESAS=3`) antes de ir pro volume
máximo ou pra qualquer banco compartilhado.

## Estrutura do gerador

```
backend/prisma/seed-demo/
├── dados-brasileiros.js   — nomes, cidades, catálogo de serviço/produto por categoria
├── geradores.js            — funções puras: PRNG determinístico, ruído gaussiano,
│                              pesos de dia da semana/mês/horário, CPF/CNPJ/telefone falsos
├── perfis.js                — perfis de comportamento (frequência de cliente, porte de
│                              empresa, popularidade de profissional, distribuições de status)
├── nomes-empresa.js         — combinador de nome de negócio por segmento
└── index.js                  — orquestrador: cria cada empresa completa e grava em lotes
```

Cada peça estatística (`geradores.js`/`perfis.js`) é pura e testada
isoladamente — o `index.js` só orquestra, sem lógica de distribuição própria.
