# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Artifacts

- **HisabKitab** (`artifacts/hisabkitab`) — React + Vite expense tracker.
  Uses Firebase (Auth + Firestore + Cloud Messaging). Optional Cloud
  Functions in `artifacts/hisabkitab/functions/` for scheduled daily
  reminder pushes and budget-alert pushes (deployed separately via the
  Firebase CLI; requires Blaze plan).
  See `artifacts/hisabkitab/SETUP.md` for Firebase connection instructions.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Web framework**: React + Vite
- **Backend (HisabKitab)**: Firebase (no local server)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/hisabkitab run dev` — run HisabKitab locally

See the `pnpm-workspace` skill for workspace structure.
