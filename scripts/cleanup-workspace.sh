#!/bin/bash
# Workspace Cleanup Automation Script
# Removes build artifacts, logs, and temporary files to free disk space

set -e

WORKSPACE_ROOT="/workspaces/expert-dollop"
cd "$WORKSPACE_ROOT"

echo "🧹 Starting workspace cleanup..."
echo ""

# Track space freed
initial_size=$(du -sb "$WORKSPACE_ROOT" 2>/dev/null | cut -f1)

# 1. Clear NX cache
if [ -d ".nx/cache" ]; then
    echo "📦 Clearing NX cache..."
    rm -rf .nx/cache/*
    echo "   ✓ NX cache cleared"
fi

# 2. Remove large log files (>10MB)
echo "📄 Removing large log files (>10MB)..."
find . -type f -name "*.log" -size +10M -not -path "./node_modules/*" -delete 2>/dev/null && echo "   ✓ Large logs removed" || echo "   ℹ No large logs found"

# 3. Clean build artifacts
echo "🏗️  Removing build artifacts..."
find . -type d \( -name "dist" -o -name "build" -o -name "out-tsc" -o -name ".next" \) \
    -not -path "./node_modules/*" \
    -not -path "./modules/*" \
    -exec rm -rf {} + 2>/dev/null && echo "   ✓ Build artifacts removed" || echo "   ℹ No build artifacts found"

# 4. Remove Python cache
echo "🐍 Cleaning Python cache..."
find . -type d \( -name "__pycache__" -o -name "*.egg-info" \) \
    -not -path "./node_modules/*" \
    -not -path "./modules/*" \
    -exec rm -rf {} + 2>/dev/null && echo "   ✓ Python cache cleared" || echo "   ℹ No Python cache found"
find . -type f \( -name "*.pyc" -o -name "*.pyo" \) \
    -not -path "./node_modules/*" \
    -not -path "./modules/*" \
    -delete 2>/dev/null

# 5. Remove TypeScript build info
echo "📘 Removing TypeScript build info..."
find . -type f -name "*.tsbuildinfo" \
    -not -path "./node_modules/*" \
    -not -path "./modules/*" \
    -delete 2>/dev/null && echo "   ✓ TypeScript build info removed" || echo "   ℹ No build info found"

# 6. Clean test coverage
echo "🧪 Removing test coverage..."
find . -type d -name "coverage" \
    -not -path "./node_modules/*" \
    -not -path "./modules/*" \
    -exec rm -rf {} + 2>/dev/null && echo "   ✓ Coverage removed" || echo "   ℹ No coverage found"

# 7. Remove temp directories
echo "🗑️  Cleaning temp directories..."
find . -type d -name "tmp" \
    -not -path "./node_modules/*" \
    -not -path "./modules/*" \
    -exec rm -rf {} + 2>/dev/null && echo "   ✓ Temp directories removed" || echo "   ℹ No temp directories found"

# Calculate space freed
final_size=$(du -sb "$WORKSPACE_ROOT" 2>/dev/null | cut -f1)
space_freed=$((initial_size - final_size))
space_freed_mb=$((space_freed / 1048576))

echo ""
echo "✨ Cleanup complete!"
echo "💾 Space freed: ${space_freed_mb}MB"
echo ""
echo "Current disk usage:"
df -h "$WORKSPACE_ROOT" | tail -n 1 | awk '{print "   Used: "$3" / "$2" ("$5")"}'
