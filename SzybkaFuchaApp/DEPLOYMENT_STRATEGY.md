# 🚀 Deployment Strategy — SzybkaFucha Blog

**Live URL:** https://fastcmsdomain.github.io/szybkafucha-blog/

---

## Current Setup

✅ **GitHub Pages is LIVE**
✅ **`.nojekyll` configured** (disables Jekyll, serves plain HTML)
✅ **`master` branch is the source**

---

## 📂 File Structure for GitHub Pages

Your repo structure must be:

```
szybkafucha-blog/
├── .nojekyll                    ← Tells GitHub Pages to serve static files
├── SzybkaFuchaApp/
│   └── blog/
│       ├── public/              ← THIS IS SERVED BY GITHUB PAGES
│       │   ├── index.html       ← Homepage
│       │   ├── blog/
│       │   │   └── *.html       ← Individual posts
│       │   └── images/          ← Post images
│       ├── content/posts/       ← Source (not served)
│       ├── scripts/             ← Source (not served)
│       └── ...
```

**GitHub Pages serves:** `SzybkaFuchaApp/blog/public/` → `https://fastcmsdomain.github.io/szybkafucha-blog/`

---

## ⚠️ PROBLEM: Current Setup

The issue: GitHub Pages is serving from **root** (`/`), but your HTML files are in:
- `SzybkaFuchaApp/blog/public/index.html` 
- `SzybkaFuchaApp/blog/public/blog/*.html`

**Result:** Your blog won't be accessible at the GitHub Pages URL yet!

---

## ✅ SOLUTION: Move Files to Root

You have **3 options:**

### **Option A: Move `public/` files to repo root (CLEANEST)**

```
szybkafucha-blog/
├── .nojekyll
├── index.html                   ← Moved from SzybkaFuchaApp/blog/public/
├── blog/                        ← Moved from SzybkaFuchaApp/blog/public/blog/
│   └── *.html
├── images/                      ← Moved from SzybkaFuchaApp/blog/public/images/
└── SzybkaFuchaApp/             ← Keep for reference/docs
    └── blog/
        ├── content/posts/      ← Markdown source
        ├── scripts/            ← Build script
        └── ...
```

**Workflow:**
1. Content Agent creates posts in `SzybkaFuchaApp/blog/content/posts/`
2. Build script outputs to `SzybkaFuchaApp/blog/public/`
3. **Copy/move** `public/*` → repo root
4. Commit & push

### **Option B: Change GitHub Pages source to `/SzybkaFuchaApp/blog/public/`**

If your GitHub Pages settings allow pointing to a subfolder:
1. Settings → Pages → Source
2. Select folder: `SzybkaFuchaApp/blog/public`
3. Save

(Note: Most repos support branch selection, not subfolder — may not work)

### **Option C: Modify build script to output to repo root**

Change `build-posts.mjs`:
```javascript
const PUBLIC_BLOG = path.join(__dirname, '..', '..', '..', 'blog');  // Output to repo root
```

**I recommend Option A** (cleanest, most common).

---

## 🔧 Implementation (Option A)

### Step 1: Create root structure

```bash
cd /Users/simacbook/.openclaw/workspace/szybkafuchaapp

# Copy blog public files to root
cp SzybkaFuchaApp/blog/public/index.html ./
mkdir -p blog images
cp -r SzybkaFuchaApp/blog/public/blog/* ./blog/
cp -r SzybkaFuchaApp/blog/public/images/* ./images/
```

### Step 2: Verify structure

```bash
ls -la
# Should see:
# - .nojekyll
# - index.html
# - blog/ (with .html files)
# - images/ (with .jpg files)
# - SzybkaFuchaApp/ (source)
```

### Step 3: Update build script

Modify `SzybkaFuchaApp/blog/scripts/build-posts.mjs`:

Change these lines:
```javascript
const BLOG_ROOT = path.join(__dirname, '..');  // Current: SzybkaFuchaApp/blog
const PUBLIC_BLOG = path.join(BLOG_ROOT, 'public', 'blog');  // Current: blog/public/blog
const PUBLIC_IMAGES = path.join(BLOG_ROOT, 'public', 'images');  // Current: blog/public/images
```

To:
```javascript
const REPO_ROOT = path.join(__dirname, '..', '..', '..');  // ../../.. = repo root
const PUBLIC_BLOG = path.join(REPO_ROOT, 'blog');  // repo root/blog
const PUBLIC_IMAGES = path.join(REPO_ROOT, 'images');  // repo root/images
```

### Step 4: Update package.json deploy script

Change deploy to also copy to root:

```json
"deploy": "npm run build && cp public/index.html ../../../ && cp -r public/blog/* ../../../blog/ && cp -r public/images/* ../../../images/ && cd ../.. && git add . && git commit -m 'Post: auto-generated' && git push origin master"
```

Or simpler: just `npm run build`, then use a separate copy command.

### Step 5: Commit & push

```bash
git add -A
git commit -m "Deploy: Move blog files to repo root for GitHub Pages"
git push origin master
```

---

## 📋 Updated Workflow (After Implementation)

**Content Agent daily workflow:**

```bash
cd SzybkaFuchaApp/blog

# 1. Create post
echo "---
title: ...
---
..." > content/posts/YYYY-MM-DD-slug.md

# 2. Add image
# cp image.jpg content/images/YYYY-MM-DD-slug.jpg

# 3. Build
npm run build

# 4. Copy outputs to repo root
cp public/index.html ../../
mkdir -p ../../blog ../../images
cp -r public/blog/* ../../blog/
cp -r public/images/* ../../images/

# 5. Commit & push
cd ../..
git add .
git commit -m "Post: Title (date)"
git push origin master
```

Or wrap this in a shell script for simplicity.

---

## 🌐 Test Live

Once deployed:

1. Visit: `https://fastcmsdomain.github.io/szybkafucha-blog/`
2. Should see homepage with post card
3. Click card → should load post HTML
4. Images should display

---

## ✨ What We're Doing

**Goal:** Make GitHub Pages serve your blog directly from the repo root.

**Result:** 
- Content Agent generates Markdown
- Build script converts to HTML
- Copy to repo root
- GitHub Pages auto-publishes
- Live in ~1 minute

---

## Next: Your Choice

Do you want me to:

1. **Implement Option A automatically?** (I'll modify build script + move files)
2. **Just show you how to do it manually?**
3. **Try Option B first?** (check GitHub Pages settings)
4. **Something else?**

Let me know! 🚀
