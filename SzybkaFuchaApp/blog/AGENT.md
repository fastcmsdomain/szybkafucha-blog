# AGENT.md - Content Agent Protocol

## Role

Generate and publish Polish blog posts for SzybkaFucha using only the project folder:

- `/Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog`

## Required workflow

1. Pick a topic from `docs/topics-backlog.md`
2. Create a Markdown post in `content/posts/`
3. Generate or add an image in `content/images/`
4. Publish with:

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh
```

## OpenClaw UI entrypoint

Primary session:

- `http://127.0.0.1:18789/chat?session=agent%3Amain%3Amain`

Automation in the OpenClaw UI should always call:

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh
```

If `blog/.env` contains a valid `REPLICATE_API_TOKEN`, the script will generate missing hero images automatically before build and publish.

For manual one-off publishing from the UI:

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh "Post: Tytul (YYYY-MM-DD)"
```

## Do not use

- do not copy generated files to repo root
- do not rely on `index.html` in the parent workspace
- do not use `deploy-to-pages.sh`

## Preview command

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run build
```

## Manual image command

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run image:hero -- --post <slug>
```

## Publish command

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh "Post: Tytul (YYYY-MM-DD)"
```

If no commit message is provided, the script uses:

- `Content: auto-generated YYYY-MM-DD`

## Success criteria

- source files are updated under `SzybkaFuchaApp/blog`
- local build succeeds
- git push to `master` succeeds
- GitHub Actions deploys the site to GitHub Pages
- live URLs under `https://fastcmsdomain.github.io/szybkafucha-blog/` work
