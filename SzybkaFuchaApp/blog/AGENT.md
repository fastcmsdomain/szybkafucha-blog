# AGENT.md - Content Agent Protocol

## Role

Generate and publish Polish blog posts for SzybkaFucha using only the project folder:

- `/Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog`

## Required workflow

1. Pick a topic from `docs/topics-backlog.md`
2. Create a Markdown post in `content/posts/`
3. Add an image in `content/images/` when needed
4. Publish with:

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh
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
