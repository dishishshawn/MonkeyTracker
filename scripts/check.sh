#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

if [[ -x "$project_root/.tools/node/bin/node" ]]; then
  export PATH="$project_root/.tools/node/bin:$PATH"
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Run 'nvm use' or install Node 22.13+." >&2
  exit 1
fi

node_major="$(node -p 'process.versions.node.split(".")[0]')"
node_minor="$(node -p 'process.versions.node.split(".")[1]')"
if (( node_major < 22 || (node_major == 22 && node_minor < 13) )); then
  echo "Node 22.13+ is required; found $(node --version)." >&2
  exit 1
fi

echo "Checking TypeScript..."
npm run typecheck

echo "Checking Expo dependency compatibility..."
CI=1 \
  __UNSAFE_EXPO_HOME_DIRECTORY="$project_root/.tools/expo" \
  npx expo install --check

echo "Monkey Tracker verification passed."
