# 🎯 NEXT STEPS — What To Do Now

**Date:** 2026-02-27  
**Status:** ✅ Everything is LIVE & READY

---

## TL;DR

Your GitHub Pages blog is **live now** at:  
👉 **https://fastcmsdomain.github.io/szybkafucha-blog/**

The Content Agent can start generating posts immediately.

---

## 1️⃣ Verify It's Working

### Test the live blog:
1. Visit: https://fastcmsdomain.github.io/szybkafucha-blog/
2. You should see:
   - Homepage with orange SzybkaFucha header
   - 1 post card: "Jak naprawić nieszczelnący kran"
   - Click → loads the full post

If nothing loads:
- Wait 1-2 minutes for GitHub Pages to refresh
- Then reload (Cmd+Shift+R to clear cache)

---

## 2️⃣ Set Up Daily Post Generation

The Content Agent should run **daily** to generate posts.

### How to trigger Content Agent:

**Option A: Create a scheduled cron job in OpenClaw**
```bash
# In OpenClaw, set up a recurring task:
"Run Content Agent daily at 9:00 AM"
→ Execute: bash /Users/simacbook/.openclaw/workspace/szybkafuchaapp/blog/scripts/daily-post.sh
```

**Option B: Manual (for now)**
```bash
# Run daily from your terminal:
cd /Users/simacbook/.openclaw/workspace/szybkafuchaapp/blog
npm run deploy
```

**Option C: Spawn a sub-agent (recommended for automation)**
```bash
# From OpenClaw, spawn sub-agent with this task:
sessions_spawn(task="Generate daily SzybkaFucha blog post", agentId="content-agent", mode="session")
```

---

## 3️⃣ Content Agent Daily Workflow

Every day, the agent should:

```bash
cd /Users/simacbook/.openclaw/workspace/szybkafuchaapp/blog

# 1. Pick a topic from docs/topics-backlog.md
# 2. Create post: content/posts/YYYY-MM-DD-slug.md
# 3. Add image: content/images/YYYY-MM-DD-slug.jpg (optional)
# 4. Build & deploy:
npm run deploy
# 5. Update memory: memory/content-log.md
```

**Single command:** `npm run deploy` does everything!

---

## 4️⃣ What Files to Track

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `blog/content/posts/*.md` | Markdown source | Daily |
| `blog/docs/topics-backlog.md` | Topic queue | Daily (mark done) |
| `blog/memory/content-log.md` | Publication log | Daily |
| `index.html` | Homepage | Auto-updated by build |
| `blog/*.html` | Posts | Auto-updated by build |

---

## 5️⃣ Safety Checklist (Before Each Post)

Before publishing, verify:
- ✅ No instructions for mains electricity (230V)
- ✅ No gas work instructions
- ✅ No structural/load-bearing work
- ✅ No roof work at height
- ✅ Polish language throughout
- ✅ Beginner-friendly (no pro tools)
- ✅ All required sections included
- ✅ Cost under 500 zł
- ✅ Image added (or skipped intentionally)

---

## 6️⃣ GitHub Integration

**Remote:** https://github.com/fastcmsdomain/szybkafucha-blog  
**Branch:** master  
**Source:** SzybkaFuchaApp/ folder

When you push:
- Files in `SzybkaFuchaApp/index.html` → served at `/` (homepage)
- Files in `SzybkaFuchaApp/blog/` → served at `/blog/` (posts)
- Files in `SzybkaFuchaApp/images/` → served at `/images/` (images)

GitHub Pages auto-refreshes in ~1 minute.

---

## 7️⃣ Key Commands

```bash
# From SzybkaFuchaApp/blog/ folder:

# Build only (no deploy)
npm run build

# Build + copy to GitHub Pages root
npm run pages

# Build + copy + commit + push (FULL DEPLOY)
npm run deploy

# Check what changed
git status

# See recent commits
git log --oneline | head -10
```

---

## 8️⃣ Customization (Optional)

### Change blog title/description
Edit: `blog/templates/index.html`
```html
<h1>🏠 SzybkaFucha</h1>
<p>Szybkie naprawy domu i ogrodu dla początkujących</p>
```

### Change post styling
Edit: `blog/templates/post.html`
- Colors: search `#ff6b35` (orange)
- Fonts: look for `font-family`
- Layout: modify CSS in `<style>` block

### Add custom domain
Settings → Pages → Custom domain → enter your domain

---

## 9️⃣ Monitoring

### Daily check
```bash
cd /Users/simacbook/.openclaw/workspace/szybkafuchaapp
git log --oneline | head -3  # See latest commits
ls -la blog/content/posts/   # See post count
```

### Weekly check
1. Visit live blog URL
2. Count posts
3. Verify images load
4. Check formatting on mobile

### Monthly review
- Read `blog/memory/content-log.md`
- Update `MEMORY.md` with stats
- Celebrate progress! 🎉

---

## 🔟 Troubleshooting

### Problem: "npm run deploy fails"
```bash
# Check syntax
npm run build  # See error details

# Check git status
git status

# Try manual push
git add .
git commit -m "Post: Title"
git push origin master
```

### Problem: "Blog doesn't update after push"
1. Wait 1-2 minutes
2. Clear browser cache (Cmd+Shift+R)
3. Check https://github.com/fastcmsdomain/szybkafucha-blog
4. Verify files are in repo root

### Problem: "Images not loading"
1. Check file in `SzybkaFuchaApp/images/`
2. Check filename matches frontmatter `image:` field
3. Verify PNG/JPG format
4. Rebuild: `npm run build && npm run pages`

---

## 📚 Documentation Reference

- **Constitution:** `blog/BOOT.md`
- **Agent Protocol:** `blog/AGENT.md`
- **Setup Guide:** `CONTENT_AGENT_GUIDE.md`
- **Deployment:** `README_GITHUB_PAGES.md`
- **Strategy:** `DEPLOYMENT_STRATEGY.md`
- **Completion:** `SETUP_COMPLETE.md`

---

## ✨ You're Ready!

Everything is set up and tested. The system is:
- ✅ Live on GitHub Pages
- ✅ Automated build pipeline
- ✅ Safety rules enforced
- ✅ Ready for daily posts

**Start generating content!** 🚀

---

## 🎬 First Content Agent Run

To trigger the first automated post generation:

```bash
# Option 1: Manual run
cd /Users/simacbook/.openclaw/workspace/szybkafuchaapp/blog
npm run deploy

# Option 2: From OpenClaw (when ready)
# Set up recurring cron task or spawn sub-agent
```

---

_Everything is production-ready as of 2026-02-27._  
_Maintain the blog by running Content Agent daily._  
_Monitor GitHub Pages for live updates._
