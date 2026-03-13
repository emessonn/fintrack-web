# Fintrack v2

Aplicacao web para controle financeiro pessoal com autenticacao Google, dashboard com indicadores de gastos e entradas, categorias personalizadas com limite de gasto e fluxo de contas a pagar.

## Principais funcionalidades

- Dashboard financeiro com filtros por periodo e categoria
- Cards de resumo (entradas, saidas e saldo)
- Grafico de entradas vs saidas por dia
- Grafico de gastos por categoria
- Alertas de metas de gasto por categoria
- Cadastro e gestao de categorias com limite opcional
- Cadastro de lancamentos (entrada e saida)
- Tabela de transacoes filtrada pelo periodo
- Fluxo de contas a pagar com recorrencia (semanal, mensal, anual)

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 3
- TanStack Query
- Axios
- Firebase Auth (Google)
- Base UI (componentes)

## Requisitos

- Node.js 20+
- npm 10+
- Backend REST em execucao (API)
- Projeto Firebase configurado para login Google

## Variaveis de ambiente

Crie um arquivo .env na raiz:

```env
VITE_API_BASE_URL=http://localhost:3000/api

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

Observacoes:

- VITE_API_BASE_URL aponta para o backend usado por transacoes, categorias e contas a pagar
- O login Google depende de todas as variaveis VITE_FIREBASE_*

## Como rodar localmente

```bash
npm install
npm run dev
```

App disponivel em:

- http://localhost:5173

## Scripts

- npm run dev: inicia ambiente de desenvolvimento
- npm run build: gera build de producao em dist
- npm run lint: executa lint
- npm run preview: sobe o build localmente para validacao

## Build de producao

```bash
npm run build
npm run preview
```

## Deploy

Este projeto e um frontend SPA (Vite). Pode ser publicado em Vercel, Netlify, Cloudflare Pages ou Nginx.

### Checklist de deploy

1. Configurar variaveis de ambiente no provedor de deploy
2. Garantir backend em producao com HTTPS
3. Configurar CORS no backend para o dominio do frontend
4. Configurar Firebase Auth com dominio de producao em Authorized domains
5. Executar build e validar fluxo principal

### Configuracoes recomendadas

- Build command: npm run build
- Output directory: dist
- SPA fallback para index.html em rotas nao estaticas

## Contrato esperado de backend

O frontend consome, no minimo, os recursos:

- /transactions
- /categories
- /bills

Com autenticacao por token Firebase no header Authorization:

- Authorization: Bearer <token>

## Estrutura resumida

- src/pages: paginas principais (dashboard, login, bills)
- src/components/finance: componentes de dominio financeiro
- src/components/ui: componentes base de UI
- src/hooks: hooks de dados e mutacoes
- src/lib: clientes de API, auth e utilitarios
- src/types: tipos de dominio

## Estado atual

- Build de producao validado com sucesso
- Existe aviso de bundle grande no build (recomendado code splitting futuro)

## Proximos passos sugeridos

1. Adicionar monitoramento de erros (exemplo: Sentry)
2. Separar ambientes dev, staging e prod
3. Aplicar lazy loading em paginas/modais para reduzir tamanho do bundle
