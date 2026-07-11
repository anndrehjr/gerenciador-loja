# Gerenciador de Salão

Sistema de gestão para salão de beleza: cadastro de clientes, catálogo de serviços, agendamentos e uma página pública do salão — tudo com dados reais em produção.

**Site:** https://salao.andre-aguiar-jr.com.br

## Estrutura do projeto

Monorepo com duas aplicações independentes:

```
gerenciador-loja/
├── frontend/          # SPA em React (Vite) — site público + painel administrativo
│   └── android/       # app Android (Capacitor) que embrulha o site público
├── backend/           # API REST em Node/Express + Prisma
├── deploy/            # docker-compose.yml de referência usado em produção
└── scripts/           # script de deploy pro servidor
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

## App Android

`frontend/android/` é um app Android gerado com [Capacitor](https://capacitorjs.com). Ele não empacota o site — o `frontend/capacitor.config.json` aponta `server.url` direto para `https://salao.andre-aguiar-jr.com.br`, então o app é uma casca nativa que sempre mostra a versão publicada do site (atualizar o site atualiza o app sozinho, sem precisar recompilar nada). Abre direto na página pública de agendamento, sem exigir login.

Ícone e splash screen ficam em `frontend/resources/` (gerados com a identidade visual do produto — gradiente roxo/azul + tesoura) e foram aplicados com `npx capacitor-assets generate --android`.

### Pré-requisitos

- [Android Studio](https://developer.android.com/studio) instalado (inclui o SDK do Android).
- Variáveis de ambiente `ANDROID_HOME` (pasta do SDK, ex. `%LOCALAPPDATA%\Android\Sdk`) e `JAVA_HOME` (JDK que vem junto do Android Studio, ex. `C:\Program Files\Android\Android Studio\jbr`).

### Rodar num emulador ou celular

```bash
cd frontend/android
./gradlew.bat installDebug     # compila e instala no emulador/dispositivo conectado (adb devices)
```

Ou abra a pasta `frontend/android` direto no Android Studio e clique em Run (▶ / Shift+F10).

### Gerar novo ícone/splash (se mudar a identidade visual)

```bash
cd frontend
npx capacitor-assets generate --android
```

Substitua antes `resources/icon.png` (1024×1024) e `resources/splash.png` / `splash-dark.png` (2732×2732).

### Publicar na Play Store (ainda não feito)

Passos que faltam, fora do escopo de código:
1. Criar conta de desenvolvedor no [Google Play Console](https://play.google.com/console) (taxa única de US$25).
2. Gerar uma chave de assinatura (`keytool` ou pelo próprio Android Studio: **Build → Generate Signed Bundle/APK**) e guardá-la em local seguro — perder essa chave impede atualizar o app depois.
3. Gerar um **Android App Bundle** assinado (`./gradlew bundleRelease`) em vez do APK de debug.
4. Preencher a ficha da loja (nome, descrição, capturas de tela, política de privacidade) e enviar para revisão.

iOS não foi configurado: exige um Mac com Xcode (ou um serviço de build na nuvem) e conta de desenvolvedor Apple (US$99/ano).
