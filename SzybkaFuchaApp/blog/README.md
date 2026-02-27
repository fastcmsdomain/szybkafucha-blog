# 📝 SzybkaFucha Blog Pipeline

**Automated content generation → Markdown → HTML → GitHub Deploy**

This is the Content Agent's workspace for the SzybkaFucha blog (szybkie naprawy domu i ogrodu — quick home and garden fixes for beginners).

---

## 📂 Folder Structure

```
blog/
├── BOOT.md                      # Blog constitution (rules, safety, style)
├── README.md                    # This file
├── package.json                 # Node dependencies
│
├── content/
│   ├── posts/                   # Markdown source files (YYYY-MM-DD-slug.md)
│   └── images/                  # Source images for posts
│
├── docs/
│   ├── post-template.md         # Post format reference
│   ├── topics-backlog.md        # List of upcoming topics (dom/ogrod)
│   └── ...
│
├── public/                      # Build output (static files)
│   ├── index.html               # Home page
│   ├── blog/
│   │   ├── nieszczelnacy-kran.html   # Individual posts
│   │   └── ...
│   └── images/                  # Published images
│
├── scripts/
│   └── build-posts.mjs          # Build script (Markdown → HTML)
│
└── templates/
    ├── post.html                # Post template
    └── index.html               # Index template
```

---

## 🚀 Workflow

### 1. Create a new post
Place a Markdown file in `content/posts/` with YAML frontmatter:

```markdown
---
title: "Jak naprawić [problem]"
date: "2026-02-28"
slug: "kebab-case-slug"
image: "2026-02-28-slug.jpg"
description: "1 sentence summary"
difficulty: 1
time: "15–30 minut"
cost: "X–Y zł"
tags: ["dom" or "ogrod", "subtopic"]
---

## Content

Your post content here...
```

### 2. Add image (optional)
Place image in `content/images/` with the same name as in frontmatter.

### 3. Build
```bash
npm run build
```

This:
- Converts Markdown → HTML
- Copies images to `public/images/`
- Updates `public/index.html`

### 4. Deploy
```bash
npm run deploy
```

Or manually:
```bash
git add .
git commit -m "Post: Title (date)"
git push origin master
```

---

## 📋 Content Rules

**Read `BOOT.md` for the full constitution.**

### Safety Hard Stops
❌ Do NOT provide instructions for:
- Mains electricity (230V/400V)
- Gas installation/repair
- Structural/load-bearing work
- Asbestos handling
- Roof work at height

✅ For these: warn reader + advise "Wezwij profesjonalistę" (call a professional).

### Audience
- Beginners (no experience)
- No pro tools
- Realistic costs (<500 zł)

### Tone
- Friendly, practical
- Short paragraphs
- Polish language

### Post Must Include
1. Title
2. 3–6 paragraphs (problem → solution)
3. Image (optional but recommended)
4. Tools/Materials/Cost section
5. Step-by-step instructions
6. Common mistakes
7. Safety note
8. CTA to SzybkaFucha (soft, 1 sentence)

---

## 📚 Topic Backlog

See `docs/topics-backlog.md` for:
- DOM (home) topics
- OGRÓD (garden) topics

Topics are rotated 50/50. Check off completed topics.

---

## 🔧 Build Script Details

**`scripts/build-posts.mjs`** is a Node.js module that:

1. Reads all `.md` files from `content/posts/`
2. Parses YAML frontmatter
3. Converts Markdown to HTML (simple processor)
4. Applies `templates/post.html`
5. Copies images to `public/images/`
6. Generates `public/index.html` with all posts

No external dependencies needed — pure JavaScript.

### Running the build

```bash
node scripts/build-posts.mjs
# or
npm run build
```

Output:
- `✅ Built: ...` for each post
- `✨ Build complete!` summary

---

## 🌐 Publishing

Posts are published as static HTML to GitHub Pages.

```bash
npm run deploy
```

This:
1. Builds all posts
2. Stages files (`git add .`)
3. Commits ("Post: auto-generated")
4. Pushes to `origin/master`

GitHub will serve static files from the repo.

---

## 💡 Example Post

See `content/posts/2026-02-27-nieszczelnacy-kran.md` for a working example:
- Full structure with all required sections
- Polish content
- Beginner-friendly tone
- Safety notes

---

## ✨ Next Steps

1. **Create more posts** using `docs/post-template.md`
2. **Add images** (JPG/PNG, <2MB, descriptive names)
3. **Mark topics as done** in `docs/topics-backlog.md`
4. **Run `npm run deploy`** to publish

---

**Questions?** Refer to `BOOT.md` for the constitution, or check the template at `docs/post-template.md`.
