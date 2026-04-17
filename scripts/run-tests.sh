#!/usr/bin/env bash
# Vitest runs in Node, but the app runs in Electron. better-sqlite3 has to
# match one ABI or the other — rebuild for Node before running, then restore
# the Electron ABI on exit so `yarn start` keeps working regardless of whether
# the tests passed, failed, or were interrupted.
set -u

restore_electron_abi() {
  echo "→ restoring better-sqlite3 Electron ABI"
  npx --no-install electron-rebuild -w better-sqlite3 >/dev/null 2>&1 || true
}
trap restore_electron_abi EXIT INT TERM

echo "→ rebuilding better-sqlite3 for Node ABI"
npm rebuild better-sqlite3 --silent >/dev/null

npx vitest run "$@"
