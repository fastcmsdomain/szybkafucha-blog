# Next Steps - to test

## Current publishing model

- Project root for source files: `/Users/simacbook/.openclaw/workspace/SzybkaFuchaApp`
- Blog source root: `/Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog`
- Local build output: `/Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/public`
- Live GitHub Pages URL: `https://fastcmsdomain.github.io/szybkafucha-blog/`

GitHub Pages should be configured to use `GitHub Actions` as the publishing source.

## Manual workflow

### Preview only

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run build
```

This regenerates:

- `blog/public/index.html`
- `blog/public/blog/*.html`
- `blog/public/images/*`

### Publish

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh
```

Optional custom commit message:

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh "Post: Tytul (2026-03-01)"
```

## OpenClaw automation

Recurring automation should call exactly this command:

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh
```

### OpenClaw UI

Main session URL:

- `http://127.0.0.1:18789/chat?session=agent%3Amain%3Amain`

For a manual publish from OpenClaw UI, send:

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh "Post: Tytul (YYYY-MM-DD)"
```

For recurring automation in OpenClaw, configure the task to execute exactly:

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh
```

OpenClaw does not need to `cd` anywhere before calling this script.

Why:

- it does not depend on the caller's current directory
- it works from the project source root
- it stages only `SzybkaFuchaApp`
- it leaves GitHub Pages deployment to GitHub Actions

### What to verify after running automation

1. Terminal output shows `npm run build`, then either a commit/push or `Nothing to commit`.
2. GitHub `Actions` shows a new green run for `Deploy Blog to GitHub Pages`.
3. GitHub `Pages` shows the latest deployment URL.
4. Live site updates under:
   - `https://fastcmsdomain.github.io/szybkafucha-blog/`
   - `https://fastcmsdomain.github.io/szybkafucha-blog/blog/<slug>.html`

## Expected live URLs

- Homepage: `https://fastcmsdomain.github.io/szybkafucha-blog/`
- Post: `https://fastcmsdomain.github.io/szybkafucha-blog/blog/nieszczelnacy-kran.html`

The URL without repo name, for example `https://fastcmsdomain.github.io/blog/nieszczelnacy-kran.html`, is expected to return 404.
