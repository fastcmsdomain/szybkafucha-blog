#!/bin/bash

###############################################################################
# deploy-to-pages.sh
# 
# Deploys built blog (HTML + images) from blog/public/ to repo root
# for GitHub Pages serving.
#
# Usage: 
#   cd blog/scripts/
#   bash deploy-to-pages.sh
#
# Or from repo root:
#   bash blog/scripts/deploy-to-pages.sh
###############################################################################

set -e

# Determine repo root (szybkafuchaapp = repo root for GitHub Pages)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BLOG_DIR="$(dirname "$SCRIPT_DIR")"
REPO_ROOT="$(dirname "$BLOG_DIR")"  # SzybkaFuchaApp is the repo root

echo "🚀 Deploying blog to GitHub Pages..."
echo "   Repo root: $REPO_ROOT"
echo "   Blog dir:  $BLOG_DIR"
echo

# Ensure build has run
if [ ! -f "$BLOG_DIR/public/index.html" ]; then
    echo "❌ Error: blog/public/index.html not found. Run 'npm run build' first."
    exit 1
fi

# Copy index.html to repo root
echo "📄 Copying index.html..."
cp "$BLOG_DIR/public/index.html" "$REPO_ROOT/"

# Ensure blog/ and images/ directories in repo root
mkdir -p "$REPO_ROOT/blog"
mkdir -p "$REPO_ROOT/images"

# Copy blog posts
if [ -d "$BLOG_DIR/public/blog" ] && [ "$(ls -A $BLOG_DIR/public/blog)" ]; then
    echo "📝 Copying blog posts..."
    cp -r "$BLOG_DIR/public/blog"/* "$REPO_ROOT/blog/" 2>/dev/null || true
fi

# Copy images
if [ -d "$BLOG_DIR/public/images" ] && [ "$(ls -A $BLOG_DIR/public/images)" ]; then
    echo "🖼️  Copying images..."
    cp -r "$BLOG_DIR/public/images"/* "$REPO_ROOT/images/" 2>/dev/null || true
fi

echo
echo "✅ Deploy complete!"
echo "   Files copied to:"
echo "   - $REPO_ROOT/index.html"
echo "   - $REPO_ROOT/blog/"
echo "   - $REPO_ROOT/images/"
echo
echo "📌 Next: commit and push"
echo "   cd $REPO_ROOT"
echo "   git add ."
echo "   git commit -m 'Post: auto-generated'"
echo "   git push origin master"
echo
