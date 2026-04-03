# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/planar-bridge run dev` — run PlanarBridge H5 dev server (port 3000)
- `pnpm --filter @workspace/planar-bridge run build:h5` — build PlanarBridge for H5 production
- `pnpm --filter @workspace/planar-bridge run build:weapp` — build PlanarBridge for WeChat Mini Program

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### PlanarBridge Mini Program (`artifacts/planar-bridge/`)
- **Type**: Taro 3.6.35 + React 18.2 + TypeScript app (WeChat Mini Program + H5)
- **Framework**: Taro (H5 mode for browser preview, weapp mode for WeChat production)
- **Dev port**: 3000
- **Routes**: `/` → Welcome, `/search` → Card Search, `/lists` → My Lists, `/settings` → Settings
- **Data source**: fabdb.net REST API (`https://api.fabdb.net`)
- **Auth**: WeChat OAuth (Taro.login) in weapp mode; Guest bypass in H5 mode
- **State**: React Context + useReducer; persisted via Taro.setStorageSync
- **Key files**:
  - `src/app.ts` — App entry (React class component, no JSX — uses React.createElement)
  - `src/app.config.ts` — Taro page config (pages, tabBar, window)
  - `src/app.scss` — Global CSS variables and keyframes
  - `src/types/index.ts` — TypeScript types (FabCard, FabList, etc.)
  - `src/constants/colors.ts` — Color constants and rarity/pitch maps
  - `src/api/fabdb.ts` — fabdb.net API client and query parsing
  - `src/store/AppContext.tsx` — Global state (user, lists, search results)
  - `src/pages/welcome/` — Login/welcome page
  - `src/pages/search/` — Main card search page (grid layout)
  - `src/pages/lists/` — Collection lists management
  - `src/pages/settings/` — User profile and app settings
  - `src/components/CardTile/` — Card tile with foil shimmer effect
  - `src/components/CardDetailModal/` — Full card detail bottom sheet
  - `src/components/AgentThinkingStrip/` — Search progress animation
  - `src/components/SearchBar/` — Animated search input
  - `src/components/SkeletonCard/` — Loading skeleton cards
  - `src/components/SuggestionChips/` — Pre-built query suggestions
  - `src/components/BottomNav/` — Navigation tab bar
- **IMPORTANT**: `app.ts` uses `React.createElement` instead of JSX because `.ts` (non-`.tsx`) files don't support JSX in babel-preset-taro. Page and component files use `.tsx` and work correctly.
- **Pricing**: TCGPlayer integration noted as future feature — currently shows "Price TBD"

### API Server (`artifacts/api-server/`)
- **Type**: Express 5 API server
- **Port**: 8080
- **Path**: `/api`

### Mockup Sandbox (`artifacts/mockup-sandbox/`)
- **Type**: Vite dev server for canvas iframe previews
- **Port**: 8081
