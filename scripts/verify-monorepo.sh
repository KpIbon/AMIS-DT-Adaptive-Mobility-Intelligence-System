#!/usr/bin/env bash
# One-shot check that the monorepo wiring is sound.
# Run from repo root after `pnpm install`.
set -euo pipefail

echo "→ pnpm workspaces"
pnpm -r list --depth=-1 2>/dev/null | head -40

echo "→ typecheck"
pnpm turbo run typecheck

echo "→ done"
