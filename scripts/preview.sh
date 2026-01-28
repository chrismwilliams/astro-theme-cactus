#!/usr/bin/env bash
set -euo pipefail

# Build and preview the site locally.
# Usage: PORT=4321 scripts/preview.sh

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PNPM_VERSION="${PNPM_VERSION:-9.12.1}"
PORT="${PORT:-4321}"

if ! command -v pnpm >/dev/null 2>&1; then
	if ! command -v corepack >/dev/null 2>&1; then
		echo "corepack is required (ships with Node.js >= 16.9). Please install Node.js and re-run." >&2
		exit 1
	fi
	corepack enable
	corepack prepare "pnpm@${PNPM_VERSION}" --activate
fi

pnpm build
pnpm preview --host localhost --port "$PORT"
