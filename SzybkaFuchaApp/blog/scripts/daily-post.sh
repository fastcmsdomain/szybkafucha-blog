#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BLOG_DIR="$(dirname "$SCRIPT_DIR")"
APP_DIR="$(dirname "$BLOG_DIR")"
REPO_ROOT="$(dirname "$APP_DIR")"
ENV_FILE="$BLOG_DIR/.env"

DEFAULT_MESSAGE="Content: auto-generated $(date +%F)"
COMMIT_MESSAGE="${1:-$DEFAULT_MESSAGE}"

echo "🚀 Running blog publish workflow..."
echo "   Blog dir:  $BLOG_DIR"
echo "   App dir:   $APP_DIR"
echo "   Repo root: $REPO_ROOT"

if [ -f "$ENV_FILE" ]; then
    set -a
    # shellcheck disable=SC1090
    . "$ENV_FILE"
    set +a
    echo "   Env file:  $ENV_FILE"
fi

cd "$BLOG_DIR"

IMAGE_PROVIDER="${BLOG_IMAGE_PROVIDER:-replicate}"
AUTO_IMAGES="${BLOG_AUTO_GENERATE_IMAGES:-true}"
AUTO_OPTIMIZE_IMAGES="${BLOG_AUTO_OPTIMIZE_IMAGES:-true}"

if [ "$AUTO_IMAGES" = "true" ]; then
    if [ "$IMAGE_PROVIDER" = "replicate" ] && [ -z "${REPLICATE_API_TOKEN:-}" ]; then
        echo "ℹ️  Skipping hero image generation: REPLICATE_API_TOKEN is not configured."
    else
        echo "🖼️  Generating missing hero images with provider: $IMAGE_PROVIDER"
        npm run image:hero -- --missing --provider "$IMAGE_PROVIDER"
    fi
fi

if [ "$AUTO_OPTIMIZE_IMAGES" = "true" ]; then
    echo "🗜️  Optimizing local image variants when tools are available"
    npm run images:optimize || echo "ℹ️  Image optimization skipped or failed locally."
fi

npm run build

git -C "$REPO_ROOT" add SzybkaFuchaApp

if git -C "$REPO_ROOT" diff --cached --quiet -- SzybkaFuchaApp; then
    echo "ℹ️  No staged changes under SzybkaFuchaApp. Nothing to commit."
    exit 0
fi

git -C "$REPO_ROOT" commit -m "$COMMIT_MESSAGE"
git -C "$REPO_ROOT" push origin master

echo "✅ Published via git push. GitHub Actions will deploy GitHub Pages."
