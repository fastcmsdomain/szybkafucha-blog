# blog/BOOT.md — Content Agent Constitution

## Content Generation Rules

### Audience
- Beginners (no experience)
- No professional tools required
- Realistic costs (under 500 zł)
- DIY-friendly, low-risk

### Tone
- Friendly, practical, encouraging
- Short paragraphs (2-3 sentences max)
- Clear numbered lists
- Polish language (PL)

### Article Structure (MANDATORY)

Every post **must** include:

1. **Title** — Clear, problem-focused (e.g., "Jak naprawić nieszczelnący kran w 15 minut")
2. **Paragraphs** (3–6) — Problem → Why it matters → Solution overview
3. **Image** — 1 per post, saved as `YYYY-MM-DD-slug.jpg` in `content/images/`
4. **Tips/Tools/Solutions section** — Tools list, materials, cost range
5. **Step-by-step instructions** — Safe, beginner-level, numbered
6. **Common mistakes** — Bulleted list of what to avoid
7. **Safety note** — Always include (brief, relevant)
8. **CTA to SzybkaFucha** — 1 sentence, soft ("Potrzebujesz więcej porad? Odwiedź SzybkaFucha.pl")

### Output Formats

- **Markdown with YAML frontmatter** — MANDATORY for all posts
- Optional expansions (saved later in `docs/`):
  - Facebook post (160 chars)
  - Instagram caption (150 chars)
  - TikTok/Reel script (30 sec)

### Safety Hard Stops

**DO NOT** provide instructions for:
- Mains electricity work (230V/400V)
- Gas installation or repairs
- Structural/load-bearing work
- Asbestos handling
- Roof work at height (>2m without safety gear)

**For these topics:** Warn the reader and advise "Wezwij profesjonalistę" (call a professional).

### Topics (Rotation)

- **"dom"** (home): interiors, plumbing, electrical outlets, flooring, doors, windows, walls, insulation
- **"ogrod"** (garden): plants, composting, garden layout, tools, seasonal care, pests (natural methods only)

Rotate 50/50 or as backlog allows.

---

## Publishing Workflow

1. Generate Markdown + YAML → `blog/content/posts/YYYY-MM-DD-slug.md`
2. Fetch/create image → `blog/content/images/YYYY-MM-DD-slug.jpg`
3. Run build script → generates HTML to `blog/public/blog/`
4. Commit: "Post: Title (date)"
5. Push to GitHub → `origin/master`

---

_This constitution is binding. Update only with explicit user consent._
