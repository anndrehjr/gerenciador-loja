# Instalação — Plataforma Style

> Versão resumida no [README](../README.md#-instalação). Aqui vai o passo a passo completo,
> incluindo o que fazer com a migration mais recente e como criar o primeiro usuário `MESTRE`
> (não existe cadastro público pra esse papel — de propósito).

## 1. Pré-requisitos

- Node.js 20
- PostgreSQL 16 (local, Docker, ou um serviço gerenciado)
- Docker, só se for usar `deploy/docker-compose.yml`

## 2. Clonar e instalar

```bash
git clone https://github.com/anndrehjr/gerenciador-loja.git
cd gerenciador-loja
```

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 3. Configurar variáveis de ambiente

```bash
cd backend
cp .env.example .env
```

Preencha pelo menos `DATABASE_URL`, `JWT_SECRET` (mínimo 32 caracteres) e `CORS_ORIGIN`
(`http://localhost:5173` em desenvolvimento). O resto tem valor padrão — ver a tabela completa no
README.

## 4. Aplicar as migrations

```bash
cd backend
npx prisma migrate deploy
```

> [!WARNING]
> A migration `20260730120000_evolucao_saas_multiempresa` (RBAC, financeiro, assinatura, auditoria,
> soft delete) foi **escrita à mão**, sem um banco de desenvolvimento disponível pra gerar/testar
> via `prisma migrate dev` no momento em que foi criada. Ela segue exatamente o formato que o
> Prisma gera (conferido contra as migrations anteriores do projeto) e o `schema.prisma` já foi
> validado com `npx prisma validate` + `npx prisma generate` sem erro — mas **rode primeiro num
> ambiente de teste/staging**, não direto em produção, e faça backup do banco antes
> (`pg_dump`) se for aplicar num banco com dado real. Depois de rodar uma vez com sucesso num
> ambiente de teste, pode aplicar em produção com confiança.

## 5. Popular com dados de exemplo (opcional)

```bash
SEED_ADMIN_SENHA="uma-senha-com-8-ou-mais-caracteres" npm run seed
```

Cria um salão de exemplo (`salao-andre`), um usuário `ADMINISTRADOR`, catálogo de serviços,
clientes e agendamentos de demonstração. Para também criar um usuário `MESTRE` de teste, rode com
`SEED_MESTRE_EMAIL` e `SEED_MESTRE_SENHA` preenchidos também.

## 6. Criar o primeiro usuário MESTRE (produção)

Não existe cadastro público pra `MESTRE` — é a equipe da própria plataforma, não um cliente. Pra
criar o primeiro (numa instalação nova, sem usar o seed), rode um script pontual com o hash de
senha gerado pela mesma função que a API usa:

```bash
cd backend
node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('sua-senha-aqui', 12).then(console.log);
"
```

E insira o usuário direto no banco (via `npx prisma studio` ou um `INSERT` manual) com
`papel = 'MESTRE'` e `salaoId = NULL`.

## 7. Rodar em desenvolvimento

```bash
# terminal 1
cd backend && npm run dev      # http://localhost:4000

# terminal 2
cd frontend && npm run dev     # http://localhost:5173 (proxy de /api pra :4000)
```

## 8. Testes

```bash
cd backend && npm test
```

Cobre a lógica pura (disponibilidade, permissões, paginação) com `node:test` — não precisa de banco
rodando. Não há testes de integração de rota (login/cadastro/agendamento/financeiro fim a fim)
ainda — precisam de um banco de teste dedicado; ver [pendências no relatório de entrega].

## 9. Build de produção / Docker

```bash
./scripts/deploy.sh api     # só backend
./scripts/deploy.sh app     # só frontend
./scripts/deploy.sh all     # os dois
```

Ver `deploy/docker-compose.yml` pra rodar os três containers (`db`, `api`, `app`) localmente com
Docker, se preferir não instalar Postgres/Node direto na máquina.
