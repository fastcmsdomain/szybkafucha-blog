# SzybkaFucha Blog Pipeline

## Project layout

- `content/posts/` - Markdown source
- `content/images/` - source images
- `templates/` - HTML templates
- `scripts/build-posts.mjs` - local static site build
- `scripts/daily-post.sh` - stable publish entrypoint
- `public/` - local generated preview files

## Build locally

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run build
```

This regenerates:

- `public/index.html`
- `public/blog/*.html`
- `public/images/*`

## Publish

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh
```

Optional custom message:

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh "Post: Tytul (2026-03-01)"
```

## OpenClaw UI

OpenClaw main session:

- `http://127.0.0.1:18789/chat?session=agent%3Amain%3Amain`

Use that session for:

- one-off publish commands
- recurring automation that runs `daily-post.sh`

Recommended automation command:

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh
```

## Deployment model

- local build writes only to `public/`
- git push carries source changes in `SzybkaFuchaApp`
- GitHub Actions deploys GitHub Pages from `public/`

The repo root is not used as a local copy target anymore.
