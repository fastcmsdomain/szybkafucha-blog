# 🤖 Content Agent Setup Guide — SzybkaFucha Blog

**Status:** ✅ **READY FOR DEPLOYMENT**

---

## What Is This?

This is an automated content pipeline for the SzybkaFucha blog. A Content Agent (AI running in OpenClaw) will:

1. Generate daily beginner-friendly posts about home and garden fixes
2. Save posts as Markdown with YAML frontmatter
3. Build them into static HTML
4. Deploy to GitHub automatically

**Result:** A live, growing blog at `https://github.com/fastcmsdomain/szybkafucha-blog`

---

## 📂 Where Everything Lives

```
szybkafuchaapp/
├── blog/                          ← Main workspace
│   ├── BOOT.md                    ← Constitution (read first!)
│   ├── AGENT.md                   ← How the agent works
│   ├── README.md                  ← Blog overview
│   ├── package.json               ← Node config
│   │
│   ├── content/
│   │   ├── posts/                 ← Markdown posts (source)
│   │   └── images/                ← Post images
│   │
│   ├── public/                    ← Build output (static HTML)
│   │   ├── index.html
│   │   ├── blog/
│   │   └── images/
│   │
│   ├── scripts/
│   │   └── build-posts.mjs        ← Build engine
│   │
│   ├── templates/
│   │   ├── post.html              ← Post template
│   │   └── index.html             ← Index template
│   │
│   ├── docs/
│   │   ├── post-template.md       ← Format reference
│   │   └── topics-backlog.md      ← Topic ideas
│   │
│   └── memory/
│       └── content-log.md         ← Daily log
│
└── README.md                       ← Project overview
```

---

## 🚀 Quick Start (For Content Agent)

### Daily Workflow

1. **Read the constitution**
   ```bash
   cat blog/BOOT.md
   ```

2. **Pick a topic**
   - From `blog/docs/topics-backlog.md`
   - Rotate: dom → ogrod → dom → ogrod

3. **Create a post**
   - Markdown file: `blog/content/posts/YYYY-MM-DD-slug.md`
   - Use `blog/docs/post-template.md` as template
   - Must include title, paragraphs, image ref, tools, steps, mistakes, safety, CTA

4. **Add an image**
   - Generate or fetch: `blog/content/images/YYYY-MM-DD-slug.jpg`
   - Name must match frontmatter

5. **Build**
   ```bash
   cd blog
   npm run build
   ```

6. **Deploy**
   ```bash
   npm run deploy
   ```
   Or manually:
   ```bash
   git add .
   git commit -m "Post: Title (date)"
   git push origin master
   ```

7. **Log it**
   - Update: `blog/memory/content-log.md`
   - Mark topic as done in `blog/docs/topics-backlog.md`

---

## ✅ What's Already Set Up

- ✅ Folder structure created
- ✅ `BOOT.md` (constitution with all rules)
- ✅ `AGENT.md` (agent protocol)
- ✅ `build-posts.mjs` (no external dependencies!)
- ✅ HTML templates (post + index)
- ✅ Sample post generated & deployed
- ✅ GitHub repo connected
- ✅ Git initialized & first commit pushed

**Test post live:** See `blog/public/blog/nieszczelnacy-kran.html`

---

## 🎯 Safety Rules (Non-Negotiable)

**DO NOT provide instructions for:**
- ❌ Mains electricity (230V/400V)
- ❌ Gas installation/repair
- ❌ Structural/load-bearing work
- ❌ Asbestos handling
- ❌ Roof work at height

**For these:** Warn reader + say "Wezwij profesjonalistę" (call a professional).

**All other home/garden topics:** ✅ Fair game

---

## 📋 Content Checklist

Every post must have:
- ✅ Title (clear, problem-focused)
- ✅ 3–6 paragraphs (problem → why it matters → solution)
- ✅ Image (optional but recommended)
- ✅ Tools/Materials/Cost section
- ✅ Step-by-step instructions (numbered)
- ✅ Common mistakes (bulleted)
- ✅ Safety note (1-2 sentences)
- ✅ CTA to SzybkaFucha (soft, 1 sentence)
- ✅ YAML frontmatter (all fields)

---

## 🖼️ Creating Images

**Options:**
1. **AI generation** (Dalle-3, Midjourney, Stable Diffusion)
   - Prompt: "Detailed photo of [action], realistic, daylight, close-up"
   - Example: "Detailed photo of a person fixing a kitchen faucet, realistic, daylight, close-up"

2. **Stock photos** (Unsplash, Pexels, Pixabay)
   - Free to use, match the topic

3. **Skip it** — Post will still build without an image

---

## 🔄 Publishing Workflow

```
1. Create post → Markdown + YAML
            ↓
2. Add image → content/images/
            ↓
3. npm run build → Converts to HTML
            ↓
4. npm run deploy → Commits + pushes to GitHub
            ↓
5. GitHub Pages → Serves static files
            ↓
6. Log it → Update memory/content-log.md
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check YAML syntax, file names, encoding |
| Git push fails | Check auth, remote, connectivity |
| Post not in index | Verify slug, date, frontmatter fields |
| Image not showing | Check name matches frontmatter, file exists |
| Unsure about content | Re-read `BOOT.md`, check examples |

---

## 💡 Example Topics

### DOM (Home)
- Jak naprawić nieszczelnący kran ✅ (done)
- Jak wymienić uszkodzony gniazdko elektryczne
- Jak zalepić pęknięcie w ścianie gipsowej
- Jak wyczyścić zatkany odpływ
- ... (see full backlog in `blog/docs/topics-backlog.md`)

### OGRÓD (Garden)
- Jak uprawiać pomidory na balkonie
- Jak zrobić komposter domowy
- Jak pozbyć się chwastów naturalnie
- ... (see full backlog)

---

## 📞 Need Help?

1. **Constitutional questions:** → Read `blog/BOOT.md`
2. **Format questions:** → Check `blog/docs/post-template.md`
3. **How the agent works:** → Read `blog/AGENT.md`
4. **Build/deploy issues:** → Check `blog/README.md`

---

## ✨ Next Steps

1. Start generating posts (1 per day recommended)
2. Mark topics as done in `blog/docs/topics-backlog.md`
3. Keep `blog/memory/content-log.md` updated
4. Monitor GitHub for successful deploys

---

**🎉 You're ready!** Start creating content.

_Setup date: 2026-02-27_
_Status: Production-ready_
