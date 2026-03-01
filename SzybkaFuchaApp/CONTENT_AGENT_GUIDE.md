# Content Agent Guide

## Purpose

This project uses OpenClaw to generate Markdown posts inside `SzybkaFuchaApp/blog`, build static HTML locally, commit source changes, and let GitHub Actions publish the site to GitHub Pages.

## Folder roles

### Source of truth

- `blog/content/posts/` - Markdown posts
- `blog/content/images/` - source images
- `blog/templates/` - HTML templates
- `blog/scripts/` - build and automation scripts
- `blog/docs/` - editorial instructions

### Local build output

- `blog/public/` - generated preview files used for local inspection and uploaded by GitHub Actions

### Not a deployment target anymore

The parent repo root is no longer the place where local automation copies HTML files for Pages.

## Recommended daily flow

1. Read `blog/BOOT.md`
2. Pick a topic from `blog/docs/topics-backlog.md`
3. Create `blog/content/posts/YYYY-MM-DD-slug.md`
4. Add `blog/content/images/YYYY-MM-DD-slug.jpg` when needed
5. Publish with:

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh
```

## Manual commands

### Local preview

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run build
```

### Publish with a custom commit message

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh "Post: Tytul (2026-03-01)"
```

## Deployment model

- local machine builds `SzybkaFuchaApp/blog/public`
- git push sends only tracked source changes under `SzybkaFuchaApp`
- GitHub Actions builds and deploys the Pages artifact from `SzybkaFuchaApp/blog/public`

This avoids copy-to-root deployment and reduces conflicts with other automations in the parent workspace.
