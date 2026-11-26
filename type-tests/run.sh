#!/usr/bin/env bash
# Type-checks type-tests/consumer.tsx against the packed library, the way an
# app would consume it.
#
# Usage: type-tests/run.sh <react-native version> <react version>
# Example: type-tests/run.sh 0.83 19.2
# Installs react and @types/react from the same minor version.
set -euo pipefail

rn_version="$1"
react_version="$2"
root="$(cd "$(dirname "$0")/.." && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

pnpm --dir "$root" pack --pack-destination "$work" >/dev/null
tarball="$(ls "$work"/*.tgz)"

cp "$root/type-tests/consumer.tsx" "$root/type-tests/tsconfig.json" "$work/"
cd "$work"
npm init -y >/dev/null
npm install --no-audit --no-fund --ignore-scripts --loglevel=error \
  "$tarball" \
  "react-native@$rn_version" \
  "@react-native/typescript-config@$rn_version" \
  "react@~$react_version.0" \
  "@types/react@~$react_version.0" \
  "typescript@$(node -p "require('$root/package.json').devDependencies.typescript")"

for pkg in react-native react @types/react typescript; do
  echo "$pkg $(node -p "require('$pkg/package.json').version")"
done
npx tsc -p tsconfig.json
echo "Types OK"
