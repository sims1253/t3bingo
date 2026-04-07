#!/usr/bin/env bash
set -euo pipefail

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  bun install
fi

echo "Environment ready."
