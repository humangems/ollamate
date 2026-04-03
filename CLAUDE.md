# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start Vite dev server (renderer only)
yarn start        # Start full Electron app (development)
yarn build        # TypeScript compile + Vite build
yarn lint         # ESLint on TypeScript/TSX files
yarn db:generate  # Generate Drizzle ORM migrations
yarn make-x64     # Package macOS x64 installer
yarn make-arm64   # Package macOS arm64 installer
```

## Architecture

Ollamate is an Electron desktop app that provides a ChatGPT-like UI for local LLM models via Ollama. It is split into two processes:

### Renderer (frontend) — `src/`
- **React 19** with **React Router** (hash-based routing): `/`, `/chat/:chatId`, `/all`
- **Redux Toolkit** manages all app state via entity adapters in `src/redux/slice/`:
  - `chatSlice`, `messageSlice`, `modelSlice`, `uiSlice`, `noteSlice`
- **tRPC client** (`src/lib/trpc.ts`) communicates with the main process over Electron IPC using `ipcLink()`
- API helper modules (`src/lib/chatApi.ts`, `messageApi.ts`, etc.) wrap tRPC client calls
- UI built with **shadcn** components, **Radix UI**, and **Tailwind CSS v4**
- Markdown rendering uses **Streamdown** with math, mermaid, and code extensions

### Main process (backend) — `electron/`
- **tRPC server** (`electron/api/trpcServer.ts`) exposes procedures over IPC
- `electron/api/chatProcedure.ts` contains all business logic: chat CRUD, message management, title generation, and LLM streaming
- **SQLite** (via **better-sqlite3** + **Drizzle ORM**) stores chats and messages at `~/Library/Application Support/Electron/OllaMateData/ollamate.db`
- `electron/db/service.ts` — `DatabaseService` class handles all DB operations
- `electron/db/schema.ts` — Drizzle schema for `chats` and `messages` tables
- `electron/setting-store.ts` — **electron-store** for persistent user settings (model, theme, etc.)
- `electron/preload.ts` — exposes `window.electronTRPC` IPC bridge to the renderer

### IPC / tRPC pattern
- All renderer→main communication goes through tRPC over IPC (not `ipcRenderer.invoke` directly, except for settings and fullscreen events)
- Procedures are queries (fetch), mutations (write), or subscriptions (streaming)
- The `chat.stream` subscription is the hot path: yields `text-delta`, `reasoning-delta`, `reasoning-start`, `reasoning-end` chunks from Ollama to the UI in real-time

### Streaming flow
1. ChatView calls `trpcClient.chat.stream.subscribe()`
2. Backend uses **Vercel AI SDK** (`streamText`) with an **Ollama** provider
3. Chunks stream to Redux state via subscription callbacks
4. Final message is persisted to SQLite after the stream completes

## Key conventions
- Path alias `@/` maps to `src/`
- IDs use UUID v7 (`uuidv7`)
- Electron Forge handles packaging and publishing; see `forge.config.ts` for signing/notarization config
