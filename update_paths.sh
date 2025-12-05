#!/bin/bash

APP_DIR=$1  # e.g., apps/security/ghostwriter-ui

if [ -z "$APP_DIR" ]; then
  echo "Usage: $0 <app-directory>"
  exit 1
fi

cd "$APP_DIR" || exit 1

# Update package.json name
jq '.name = "@expert-dollop/" + (.name | split("/")[-1])' package.json > package.json.tmp
mv package.json.tmp package.json

# Update imports in TypeScript/JavaScript files
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec \
  sed -i 's|from ['\''"]../../../shared/|from '\''@expert-dollop/|g' {} \;

# Update vite.config.ts alias paths
sed -i "s|'../../../shared|'../../shared|g" vite.config.ts

echo "✅ Paths updated in $APP_DIR"