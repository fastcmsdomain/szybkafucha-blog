# 🌐 GitHub Pages Setup — LIVE & READY

**Blog URL:** https://fastcmsdomain.github.io/szybkafucha-blog/

---

## ✅ What's Done

- ✅ GitHub Pages enabled
- ✅ `.nojekyll` file added (disables Jekyll)
- ✅ Blog files deployed to repo root
- ✅ HTML + images in correct location
- ✅ Ready for daily posts

---

## 📂 Current Structure

```
szybkafucha-blog/  (GitHub Pages serves from root)
├── .nojekyll                    ← Disables Jekyll processing
├── index.html                   ← Homepage (posts grid)
├── blog/
│   └── nieszczelnacy-kran.html  ← Individual posts
├── images/                      ← Post images
└── SzybkaFuchaApp/
    └── blog/
        ├── content/posts/       ← Markdown source
        ├── scripts/
        │   ├── build-posts.mjs
        │   └── deploy-to-pages.sh  ← Copies to root
        └── public/              ← Build output
```

---

## 🚀 Daily Workflow (Updated)

### Content Agent Process

```bash
cd SzybkaFuchaApp/blog

# 1. Create Markdown post
cat > content/posts/2026-02-28-example.md << 'EOF'
---
title: "Jak naprawić [problem]"
date: "2026-02-28"
slug: "example"
image: "2026-02-28-example.jpg"
description: "1 sentence"
difficulty: 1
time: "15–30 minut"
cost: "X–Y zł"
tags: ["dom", "example"]
---

## Content here...
EOF

# 2. (Optional) Add image
# cp image.jpg content/images/2026-02-28-example.jpg

# 3. Build
npm run build

# 4. Deploy to GitHub Pages
npm run pages

# 5. Commit & push (from repo root)
cd ../..
git add .
git commit -m "Post: Jak naprawić problem (2026-02-28)"
git push origin master
```

### Or Use the Deploy Command (from blog folder)

```bash
cd SzybkaFuchaApp/blog
npm run deploy  # Does all steps: build → pages → commit → push
```

---

## 📋 Script Details

### `npm run build`
- Reads: `content/posts/*.md`
- Outputs: `public/blog/*.html` + `public/index.html`

### `npm run pages`
- Runs: `npm run build`
- Then: `bash scripts/deploy-to-pages.sh`
- Copies: `public/*` → repo root

### `bash scripts/deploy-to-pages.sh`
- Copies `index.html` to repo root
- Copies `blog/*.html` to repo root `blog/` folder
- Copies `images/*` to repo root `images/` folder

### `npm run deploy`
- Runs: `npm run pages`
- Then: `git add .` + `git commit` + `git push`
- **Full automation from build to publish**

---

## 🌍 Accessing the Blog

**Live URL:** https://fastcmsdomain.github.io/szybkafucha-blog/

What you'll see:
1. **Homepage** (`index.html`) — Grid of all posts
2. **Individual posts** — Click any card → `blog/slug.html`
3. **Images** — Served from `/images/`

---

## ✨ What Happens When Content Agent Publishes

1. **Agent creates:** `SzybkaFuchaApp/blog/content/posts/YYYY-MM-DD-slug.md`
2. **Build script:** Converts → `SzybkaFuchaApp/blog/public/blog/slug.html`
3. **Deploy script:** Copies → `blog/slug.html` (repo root)
4. **Git:** Commits & pushes
5. **GitHub Pages:** Auto-refreshes within ~1 minute
6. **Live:** Post appears at `https://fastcmsdomain.github.io/szybkafucha-blog/blog/slug.html`

---

## 🧪 Test It Now

1. Visit: https://fastcmsdomain.github.io/szybkafucha-blog/
2. You should see the homepage with 1 post card
3. Click the card → loads `nieszczelnacy-kran.html`
4. Everything styled & formatted

If something's missing:
- Wait 1-2 minutes for GitHub Pages to refresh
- Check GitHub repo for latest commit
- Verify files in repo root: `index.html`, `blog/`, `images/`

---

## 📝 Making Changes

### From Local (Recommended)

```bash
cd SzybkaFuchaApp/blog

# Edit or create post
vim content/posts/YYYY-MM-DD-slug.md

# Build & deploy
npm run deploy
```

### From GitHub Web Editor

If you need to:
1. Go to repo → Edit `index.html` or `blog/slug.html` directly
2. Commit
3. Wait 1 min for Pages refresh

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Blog not loading | Wait 1-2 min for GitHub Pages refresh |
| Old post showing | Clear browser cache (Cmd+Shift+R) |
| Images not loading | Check `images/` folder has files |
| Build fails | Check Markdown syntax, YAML fields |
| Styles look broken | Verify paths in HTML (should be `/blog/...`, `/images/...`) |

---

## 📚 Complete Command Reference

```bash
# Build posts only
npm run build

# Build + copy to root for GitHub Pages
npm run pages

# Build + copy + commit + push (full automation)
npm run deploy

# Manual copy (if needed)
bash scripts/deploy-to-pages.sh

# Check status
git status
git log --oneline
```

---

## 🎯 Next Steps for Content Agent

1. **Tomorrow:** Generate post #2
2. **Mark backlog:** Check off completed topic in `docs/topics-backlog.md`
3. **Log it:** Update `memory/content-log.md`
4. **Keep rotating:** dom → ogrod → dom → ogrod

---

## 💡 Tips

- **Images optional** — Blog works without them
- **Polish only** — Keep all content in Polish
- **Beginner focus** — No pro tools or expertise assumed
- **Safety first** — Never instruct on dangerous topics
- **Backlog rotation** — Alternate home/garden topics

---

## 🚀 Ready?

```bash
cd /Users/simacbook/.openclaw/workspace/szybkafuchaapp/blog
npm run deploy
```

That's it! Blog is live and ready for daily content.

---

_Last updated: 2026-02-27_  
_Status: ✅ Production Ready_
