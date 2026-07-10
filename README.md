# Gerenciador de Salão

Sistema de gestão para salão de beleza: cadastro de clientes, catálogo de serviços, agendamentos e uma página pública do salão — tudo com dados reais em produção.

**Site:** https://salao.andre-aguiar-jr.com.br

## Estrutura do projeto

Monorepo com duas aplicações independentes:

```
gerenciador-loja/
├── frontend/   # SPA em React (Vite) — site público + painel administrativo
├── backend/    # API REST em Node/Express + Prisma
├── deploy/     # docker-compose.yml de referência usado em produção
└── scripts/    # script de deploy pro servidor
```

## Como funciona

- **Site público** (`/`): mostra os serviços do salão, direto do banco de dados — sem link de login visível.
- **Painel administrativo** (`/login` e rotas protegidas): login com sessão real (JWT em cookie httpOnly), CRUD de clientes, serviços e agendamentos.
- **Notificações via WhatsApp** (opcional): confirmação de agendamento, lembrete e aviso de cancelamento, usando a Cloud API oficial da Meta. Desligado por padrão — liga sozinho quando as credenciais são configuradas.

## Tecnologias

**Frontend**
- React + Vite
- React Router
- Tailwind CSS

**Backend**
- Node.js + Express
- Prisma ORM + PostgreSQL
- Autenticação com bcrypt + JWT (cookie httpOnly)
- Rate limiting e headers de segurança (helmet)

**Infraestrutura**
- Containers Docker (banco, API e frontend separados)
- nginx como proxy reverso e servidor de estáticos
- Deploy em VPS próprio, atrás de Cloudflare + nginx-proxy-manager (TLS via Let's Encrypt)

## Rodando localmente

Pré-requisitos: Node 20+, um banco PostgreSQL acessível.

### Backend

```bash
cd backend
cp .env.example .env   # preencher DATABASE_URL, JWT_SECRET etc.
npm install
npx prisma migrate deploy
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O Vite já faz proxy de `/api` para `http://localhost:4000` em desenvolvimento.

## Deploy

O deploy roda em containers Docker num VPS, com banco, API e frontend isolados em rede própria. O script `scripts/deploy.sh` empacota o código, envia pro servidor e reconstrói os containers:

```bash
./scripts/deploy.sh api    # só backend
./scripts/deploy.sh app    # só frontend
./scripts/deploy.sh all    # os dois
```

`deploy/docker-compose.yml` e `deploy/.env.example` documentam a configuração usada em produção.
