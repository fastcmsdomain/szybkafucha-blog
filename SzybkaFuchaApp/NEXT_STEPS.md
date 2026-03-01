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

Why:

- it does not depend on the caller's current directory
- it works from the project source root
- it stages only `SzybkaFuchaApp`
- it leaves GitHub Pages deployment to GitHub Actions

## Expected live URLs

- Homepage: `https://fastcmsdomain.github.io/szybkafucha-blog/`
- Post: `https://fastcmsdomain.github.io/szybkafucha-blog/blog/nieszczelnacy-kran.html`

The URL without repo name, for example `https://fastcmsdomain.github.io/blog/nieszczelnacy-kran.html`, is expected to return 404.
