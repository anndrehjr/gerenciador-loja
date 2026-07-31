# Permissões (RBAC) — Plataforma Style

## Papéis

| Papel | Quem é |
|---|---|
| `DONO` | Dono do salão — acesso total. Todo salão nasce com um `DONO` (quem cria a conta). |
| `GERENTE` | Gerencia o dia a dia sem ver o financeiro nem mexer nas configurações do salão. |
| `PROFISSIONAL` | Vê só a própria agenda e os clientes que já atendeu. Login vinculado a um registro de `Profissional` específico. |
| `RECEPCIONISTA` | Agenda e clientes — o suficiente pra atender o telefone e marcar horário. |

## Matriz de recursos

| Recurso | `DONO` | `GERENTE` | `PROFISSIONAL` | `RECEPCIONISTA` |
|---|:---:|:---:|:---:|:---:|
| Painel | ✅ | ✅ | ✅ | ✅ |
| Agenda | ✅ | ✅ | ✅ (só a própria) | ✅ |
| Clientes | ✅ | ✅ | ✅ (só quem atendeu) | ✅ |
| Serviços (gerenciar) | ✅ | ❌ | ❌ | ❌ |
| Equipe | ✅ | ✅ | ❌ | ❌ |
| Financeiro | ✅ | ❌ | ❌ | ❌ |
| Relatórios | ✅ | ❌ | ❌ | ❌ |
| Configurações | ✅ | ❌ | ❌ | ❌ |

> [!NOTE]
> **Leitura** do catálogo de serviços e da lista de profissionais fica aberta a qualquer papel com
> acesso à Agenda — precisam disso pra criar/editar um agendamento. Só **gerenciar** (criar/editar/
> excluir) o catálogo em si é exclusivo de quem tem o recurso "servicos"/"equipe". Essa é uma
> decisão de implementação que preenche uma lacuna que a matriz original não especificava
> explicitamente (a matriz só falava em "Serviços" como seção do menu, não em leitura de apoio) —
> registrado aqui pra não parecer inconsistência.

## Onde a matriz vive

- **Backend (fonte da verdade):** `backend/src/biblioteca/permissoes.js` (`RECURSOS_POR_PAPEL`) +
  `backend/src/middleware/permissoes.js` (`verificarPermissao(recurso)`), aplicado nas rotas
  (`backend/src/rotas/*.rotas.js`).
- **Frontend (só cosmético — esconder/mostrar menu e botão):**
  `frontend/src/biblioteca/permissoes.js` (mesmo vocabulário, mantido manualmente em espelho) +
  `frontend/src/ganchos/usePermissao.js`.

**O frontend nunca é a autorização de verdade.** Mesmo que alguém adultere o JavaScript no
navegador pra mostrar um botão escondido, a chamada à API vai ser rejeitada com 403 pelo backend —
é ele quem decide, sempre.

## Como o papel chega até a requisição

1. No login (`POST /auth/login`) ou no cadastro público (`POST /signup`), o backend resolve o
   `MembroEquipe` do usuário naquele salão (`servicos/equipe.servico.js#resolverMembroEquipe`) e
   embute `papelEquipe` (e `profissionalId`, se for `PROFISSIONAL`) no JWT assinado
   (`utilitarios/jwt.js#assinarTokenSessao`).
2. Em toda requisição autenticada, `exigirSalao` (`middleware/autenticacao.js`) copia esses campos
   do JWT decodificado pra `req.papelEquipe`/`req.profissionalId`.
3. `verificarPermissao(recurso)` checa `req.papelEquipe` contra a matriz antes de deixar a
   requisição chegar no controlador.
4. Dentro do controlador, quando o recurso pede **escopo de dado** (não só "pode ou não pode
   acessar a tela"), o próprio controlador filtra a query — ver `comEscopoDoPapel()` em
   `clientes.controlador.js` e `agendamentos.controlador.js`. É isso que impede um `PROFISSIONAL`
   de ver a agenda de outro colega só trocando um id na URL, mesmo que a rota em si esteja liberada
   pro papel dele.

## Efeito de uma sessão ficar "desatualizada"

O JWT dura até 8h (`EXPIRA_EM` em `utilitarios/jwt.js`). Se o `DONO` mudar o papel de alguém no meio
do dia, a pessoa afetada só passa a valer a nova permissão **no próximo login** — o token antigo
continua com o papel antigo até expirar. `GET /auth/me` já mostra o papel atualizado (lê do banco,
não do token) pra a tela refletir a mudança visualmente mais cedo, mas a aplicação de fato (o que a
API aceita) segue o token até ele expirar. Isso é uma janela de até 8h, consistente com o resto do
sistema (nada mais nele revalida a sessão em tempo real).

## Adicionar um papel novo

1. Adicionar o valor no enum `PapelEquipe` (`schema.prisma`) + migration.
2. Adicionar a entrada em `RECURSOS_POR_PAPEL` nos dois lados (backend e frontend).
3. Se o papel precisar de escopo de dado (como `PROFISSIONAL`), adicionar o filtro no(s)
   controlador(es) relevante(s) — não existe um mecanismo genérico pra isso hoje, é caso a caso.
