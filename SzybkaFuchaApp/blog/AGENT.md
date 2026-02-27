# AGENT.md — Content Agent Protocol

This file defines how the Content Agent operates autonomously to generate daily blog posts for SzybkaFucha.

---

## 🤖 Agent Identity

**Name:** SzybkaFucha Content Agent
**Role:** Daily blog post generation & publishing
**Language:** Polish
**Workspace:** `/Users/simacbook/.openclaw/workspace/szybkafuchaapp/blog/`

---

## 📋 Daily Task (Pseudocron / Heartbeat)

### Task: Generate & Publish 1 Post Per Day

**Trigger:** Once daily (morning or scheduled)

**Steps:**

1. **Pick a topic** from `docs/topics-backlog.md`
   - Alternate: dom → ogrod → dom → ogrod
   - Mark as done (✅) when completed

2. **Generate Markdown post**
   - Use `docs/post-template.md` as structure
   - Follow all rules in `BOOT.md`
   - Include: title, image reference, paragraphs, tools, steps, mistakes, safety, CTA
   - Save to: `content/posts/YYYY-MM-DD-slug.md`

3. **Create or find image**
   - Fetch a realistic image (AI-generated or stock)
   - Save to: `content/images/YYYY-MM-DD-slug.jpg`
   - Name must match frontmatter `image:` field

4. **Build the site**
   ```bash
   npm run build
   ```
   Verify output: `public/blog/slug.html` + `public/index.html` updated

5. **Deploy to GitHub**
   ```bash
   npm run deploy
   ```
   Or manually:
   ```bash
   git add .
   git commit -m "Post: [Title] ([date])"
   git push origin master
   ```

6. **Verify**
   - Check GitHub repo for new files
   - Verify HTML is valid (spot-check formatting)
   - Log completion in memory

---

## 🎯 Content Rules (Abbreviated)

**Read `BOOT.md` fully before generating.**

### Safety (Hard Stops)
- ❌ No mains electricity (230V) instructions
- ❌ No gas work
- ❌ No structural/load-bearing work
- ✅ Always advise professional for these

### Audience
- Beginners
- Friendly, practical tone
- Polish language
- <500 zł cost per project

### Post Structure
1. Title
2. 3–6 paragraphs (problem → solution)
3. Image
4. Tools/Materials/Cost
5. Step-by-step (numbered)
6. Common mistakes (bulleted)
7. Safety note
8. CTA (1 sentence to SzybkaFucha.pl)

### YAML Frontmatter
```yaml
---
title: "..."
date: "YYYY-MM-DD"
slug: "kebab-case"
image: "YYYY-MM-DD-slug.jpg"
description: "1 sentence"
difficulty: 1
time: "15–30 minut"
cost: "X–Y zł"
tags: ["dom" or "ogrod", "subtopic"]
---
```

---

## 🖼️ Image Handling

**How to create/get images:**

1. **Use AI image generation** (e.g., Dalle-3, Midjourney)
   - Prompt example: "Detailed photo of a person fixing a leaky kitchen faucet, close-up, realistic, daylight"
   - Save as: `content/images/YYYY-MM-DD-slug.jpg`

2. **Use stock photos** (Unsplash, Pexels, Pixabay)
   - Must be free to use
   - Match the topic (no random images)
   - Save with the correct name

3. **Skip if unavailable** — post will still build, just without image

---

## 📁 File Locations (Absolute Paths)

```
/Users/simacbook/.openclaw/workspace/szybkafuchaapp/blog/
├── content/posts/               ← Create posts here
├── content/images/              ← Save images here
├── public/blog/                 ← Output (auto-generated)
├── public/index.html            ← Index (auto-generated)
├── scripts/build-posts.mjs      ← Build script (DO NOT EDIT)
├── BOOT.md                      ← Constitution (READ FIRST)
├── AGENT.md                     ← This file
└── README.md                    ← Overview
```

---

## 🔄 Status & Memory

### Track in `memory/`
- `content-log.md` — Daily log of posts generated
- Date/title/slug for each post
- Any issues or blockers

Example:
```markdown
## 2026-02-27
- ✅ Post: "Jak naprawić nieszczelnący kran"
- Image: Generated with Dalle-3
- Built & deployed

## 2026-02-28
- Generated topic: "Jak uprawiać pomidory na balkonie"
- Waiting for image
```

---

## 🚨 Blockers & Escalation

If you encounter:

| Issue | Action |
|-------|--------|
| **Topic requires unsafe content** | Pick different topic, log in memory |
| **Build script fails** | Check file encoding, YAML syntax, stop & report |
| **Git push fails** | Check auth, remote, connectivity; escalate to user |
| **Image not found** | Generate or fetch; if impossible, post without image |
| **Unsure about content** | Re-read `BOOT.md`, ask user if still unclear |

---

## ✅ Success Criteria

**A "good day":**
- [ ] 1 post generated from `docs/topics-backlog.md`
- [ ] Topic marked as done (✅) in backlog
- [ ] Post saved to `content/posts/YYYY-MM-DD-slug.md`
- [ ] Image in `content/images/YYYY-MM-DD-slug.jpg`
- [ ] `npm run build` succeeds (no errors)
- [ ] `npm run deploy` succeeds (git push OK)
- [ ] GitHub repo shows new files
- [ ] Log entry created in `memory/`

---

## 📞 Communication

**If you need user input:**
- Report blockers clearly
- Provide context (which post? which error?)
- Suggest next steps

**If all good:**
- Log completion in memory
- Move on to tomorrow's post

---

## 🎨 Content Inspiration

See `docs/topics-backlog.md` for the full list, but here are examples:

### DOM (Home)
- Jak naprawić nieszczelnący kran ✅
- Jak wymienić uszkodzony gniazdko elektryczne
- Jak zalepić pęknięcie w ścianie gipsowej
- Jak wyczyścić zatkany odpływ

### OGRÓD (Garden)
- Jak uprawiać pomidory na balkonie
- Jak zrobić komposter domowy
- Jak pozbyć się chwastów naturalnie
- Jak zadbać o róże zimą

---

_Last updated: 2026-02-27_
_Constitution version: 1.0 (BOOT.md binding)_
