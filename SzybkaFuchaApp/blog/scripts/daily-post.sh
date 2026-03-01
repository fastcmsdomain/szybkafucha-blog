#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BLOG_DIR="$(dirname "$SCRIPT_DIR")"
APP_DIR="$(dirname "$BLOG_DIR")"
REPO_ROOT="$(dirname "$APP_DIR")"

DEFAULT_MESSAGE="Content: auto-generated $(date +%F)"
COMMIT_MESSAGE="${1:-$DEFAULT_MESSAGE}"

echo "🚀 Running blog publish workflow..."
echo "   Blog dir:  $BLOG_DIR"
echo "   App dir:   $APP_DIR"
echo "   Repo root: $REPO_ROOT"

cd "$BLOG_DIR"
npm run build

git -C "$REPO_ROOT" add SzybkaFuchaApp

if git -C "$REPO_ROOT" diff --cached --quiet -- SzybkaFuchaApp; then
    echo "ℹ️  No staged changes under SzybkaFuchaApp. Nothing to commit."
    exit 0
fi

git -C "$REPO_ROOT" commit -m "$COMMIT_MESSAGE"
git -C "$REPO_ROOT" push origin master

echo "✅ Published via git push. GitHub Actions will deploy GitHub Pages."
