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
4. Generate a hero image when needed:

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run image:hero -- --post <slug>
```

Default provider is `replicate`, loaded from `blog/.env`.

Local setup:

1. Put your real `REPLICATE_API_TOKEN` into `blog/.env`
2. Keep `blog/.env` local only. It is ignored by git via `blog/.gitignore`
3. Start with `REPLICATE_IMAGE_MODEL="black-forest-labs/flux-schnell"`

Optional provider override:

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run image:hero -- --post <slug> --provider pollinations
```

5. Publish with:

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh
```

## OpenClaw UI workflow

Use the main OpenClaw UI session:

- `http://127.0.0.1:18789/chat?session=agent%3Amain%3Amain`

### One-off publish from UI

Paste this command into the session:

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh "Post: Tytul (YYYY-MM-DD)"
```

### Recurring automation in UI

Configure OpenClaw automation to execute:

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh
```

Do not point automation at the repo root. The script already resolves:

- project root
- blog root
- git repo root

and runs the correct workflow from `SzybkaFuchaApp/blog`.

When `blog/.env` contains a valid `REPLICATE_API_TOKEN`, `daily-post.sh` also auto-generates missing hero images before the build.

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

### Generate a hero image

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run image:hero -- --post komposter-domowy
```

### Generate all missing hero images

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run image:hero -- --missing
```

## Deployment model

- local machine builds `SzybkaFuchaApp/blog/public`
- git push sends only tracked source changes under `SzybkaFuchaApp`
- GitHub Actions builds and deploys the Pages artifact from `SzybkaFuchaApp/blog/public`

This avoids copy-to-root deployment and reduces conflicts with other automations in the parent workspace.

## Post-run checks

After OpenClaw automation runs, verify:

1. a new commit appeared on `master`
2. `Deploy Blog to GitHub Pages` is green in GitHub Actions
3. the homepage and changed post are visible live on GitHub Pages
