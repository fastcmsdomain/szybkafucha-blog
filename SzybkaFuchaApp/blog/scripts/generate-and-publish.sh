#!/bin/bash
# generate-and-publish.sh — Generate a blog post via Bielik (Ollama) and publish it.
# Usage: ./generate-and-publish.sh [--dry-run]
#
# Workflow:
#   1. Read next topic from topics-backlog.md (alternating dom/ogrod)
#   2. Send prompt to Bielik via Ollama API
#   3. Save markdown post to content/posts/
#   4. Update backlog
#   5. Run daily-post.sh (image gen + build + git push)
#   6. Post summary to Facebook Page (if FB_PAGE_ACCESS_TOKEN is set)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BLOG_DIR="$(dirname "$SCRIPT_DIR")"
BACKLOG="$BLOG_DIR/docs/topics-backlog.md"
POSTS_DIR="$BLOG_DIR/content/posts"
BOOT_MD="$BLOG_DIR/BOOT.md"
TODAY="$(date +%F)"
DRY_RUN="${1:-}"

ENV_FILE="$BLOG_DIR/.env"
if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    . "$ENV_FILE"
    set +a
fi

OLLAMA_URL="${OLLAMA_URL:-http://127.0.0.1:11434/api/generate}"
OLLAMA_MODEL="${OLLAMA_MODEL:-SpeakLeash/bielik-11b-v3.0-instruct:Q4_K_M}"

# --- Safety hard-stop topics (skip these) ---
SAFETY_SKIP="elektryczn|gazow|konstrukcyjn|azbestow|dach"

# --- Determine last published category ---
last_category() {
    # Find the most recent completed topic and its category
    local last_dom last_ogrod
    last_dom=$(grep -n '\[x\].*DOM\|## DOM' "$BACKLOG" | head -1 | cut -d: -f1)
    last_ogrod=$(grep -n '\[x\].*OGRÓD\|## OGRÓD' "$BACKLOG" | head -1 | cut -d: -f1)

    # Find the last completed item in each section
    local last_dom_date last_ogrod_date
    last_dom_date=$(sed -n '/^## DOM/,/^## OGRÓD/p' "$BACKLOG" | grep '\[x\]' | tail -1 | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' || echo "2000-01-01")
    last_ogrod_date=$(sed -n '/^## OGRÓD/,/^---/p' "$BACKLOG" | grep '\[x\]' | tail -1 | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' || echo "2000-01-01")

    if [[ "$last_dom_date" > "$last_ogrod_date" ]]; then
        echo "dom"
    else
        echo "ogrod"
    fi
}

# --- Pick next topic ---
pick_next_topic() {
    local last_cat
    last_cat=$(last_category)

    local next_section
    if [[ "$last_cat" == "dom" ]]; then
        next_section="OGRÓD"
    else
        next_section="DOM"
    fi

    # Extract first unchecked topic from the target section
    local topic
    if [[ "$next_section" == "DOM" ]]; then
        topic=$(sed -n '/^## DOM/,/^## OGRÓD/p' "$BACKLOG" | grep '^\- \[ \]' | grep -v '✅' | head -1)
    else
        topic=$(sed -n '/^## OGRÓD/,/^---/p' "$BACKLOG" | grep '^\- \[ \]' | grep -v '✅' | head -1)
    fi

    # Skip safety hard-stop topics
    while echo "$topic" | grep -qiE "$SAFETY_SKIP"; do
        echo "  Skipping safety topic: $topic" >&2
        if [[ "$next_section" == "DOM" ]]; then
            topic=$(sed -n '/^## DOM/,/^## OGRÓD/p' "$BACKLOG" | grep '^\- \[ \]' | grep -viE "$SAFETY_SKIP" | head -1)
        else
            topic=$(sed -n '/^## OGRÓD/,/^---/p' "$BACKLOG" | grep '^\- \[ \]' | grep -viE "$SAFETY_SKIP" | head -1)
        fi
        break
    done

    if [[ -z "$topic" ]]; then
        # Fallback: try the other section
        if [[ "$next_section" == "DOM" ]]; then
            topic=$(sed -n '/^## OGRÓD/,/^---/p' "$BACKLOG" | grep '^\- \[ \]' | grep -viE "$SAFETY_SKIP" | head -1)
        else
            topic=$(sed -n '/^## DOM/,/^## OGRÓD/p' "$BACKLOG" | grep '^\- \[ \]' | grep -viE "$SAFETY_SKIP" | head -1)
        fi
    fi

    if [[ -z "$topic" ]]; then
        echo "ERROR: No more topics in backlog!" >&2
        exit 1
    fi

    # Extract just the topic text (strip checkbox and any stale ✅ marks)
    echo "$topic" | sed 's/^- \[ \] //' | sed 's/ *✅.*//'
}

# --- Generate slug from topic ---
make_slug() {
    echo "$1" | tr '[:upper:]' '[:lower:]' \
        | sed 's/ą/a/g;s/ć/c/g;s/ę/e/g;s/ł/l/g;s/ń/n/g;s/ó/o/g;s/ś/s/g;s/ź/z/g;s/ż/z/g' \
        | sed 's/jak //g' \
        | sed 's/[^a-z0-9]/-/g' \
        | sed 's/--*/-/g;s/^-//;s/-$//' \
        | cut -c1-50
}

# --- Detect tag from topic ---
detect_tag() {
    local topic_lower
    topic_lower=$(echo "$1" | tr '[:upper:]' '[:lower:]')
    if echo "$topic_lower" | grep -qiE "roślin|ogród|traw|gleb|zioł|komposter|chwast|mszyc|sadzon|róż|mróz|podlew|pomidor|warzyw"; then
        echo '["ogród", "rośliny"]'
    else
        echo '["dom", "naprawy"]'
    fi
}

# --- Build Ollama prompt ---
build_prompt() {
    local topic="$1" slug="$2" tags="$3"
    cat <<PROMPT
Napisz artykuł na bloga w języku polskim na temat: "$topic".

Format: Markdown z YAML frontmatter.

Frontmatter musi zawierać DOKŁADNIE ten format (bez bold, bez gwiazdek):
---
title: "$topic"
date: "$TODAY"
slug: "$slug"
image: "$TODAY-$slug.jpg"
description: krótki opis artykułu
difficulty: 1
time: szacowany czas
cost: zakres kosztów w zł
tags: $tags
---

Struktura artykułu (OBOWIĄZKOWA):
1. Wstęp (2-3 zdania, problem i dlaczego warto)
2. Dlaczego warto to wiedzieć (krótki akapit)
3. Potrzebne narzędzia i materiały (lista, koszt)
4. Instrukcja krok po kroku (numerowana, bezpieczna, dla początkujących)
5. Częste błędy (lista punktowana)
6. Uwaga dotycząca bezpieczeństwa
7. Zakończ: "Potrzebujesz więcej porad? Odwiedź [BlogSzybkaFucha.app](https://blog.szybkafucha.app) lub znajdź fachowca w 5 minut na [SzybkaFucha.app](https://szybkafucha.app)."

Ton: przyjazny, praktyczny, zachęcający. Krótkie akapity (2-3 zdania max). Język: polski.
Nie dawaj porad dotyczących pracy z prądem 230V, instalacją gazową, pracami konstrukcyjnymi.

Napisz kompletny artykuł:
PROMPT
}

# --- Fix frontmatter if Bielik adds bold markers ---
fix_frontmatter() {
    local content="$1"
    # Remove ** from frontmatter lines
    echo "$content" | sed '/^---$/,/^---$/s/\*\*//g'
}

# --- Post to Facebook Page ---
post_to_facebook() {
    local title="$1" description="$2" slug="$3"

    if [[ -z "${FB_PAGE_ACCESS_TOKEN:-}" || -z "${FB_PAGE_ID:-}" ]]; then
        echo "  Facebook: FB_PAGE_ACCESS_TOKEN or FB_PAGE_ID not set, skipping."
        return 0
    fi

    local post_url="https://blog.szybkafucha.app/blog/$slug.html"
    local message
    message=$(cat <<MSG
$title

$description

Czytaj cały artykuł: $post_url

#SzybkaFucha #DIY #PoradyDomowe #ZróbToSam
MSG
)

    echo "  Posting to Facebook Page..."
    local response
    response=$(curl -s -X POST "https://graph.facebook.com/v19.0/${FB_PAGE_ID}/feed" \
        --data-urlencode "message=$message" \
        -d "link=$post_url" \
        -d "access_token=$FB_PAGE_ACCESS_TOKEN")

    if echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if 'id' in d else 1)" 2>/dev/null; then
        local fb_id
        fb_id=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
        echo "  Facebook post published: $fb_id"
    else
        echo "  Facebook post failed: $response" >&2
    fi
}

# =============================================================================
# MAIN
# =============================================================================

echo "=== Blog Post Generator & Publisher ==="
echo "    Date: $TODAY"
echo "    Model: $OLLAMA_MODEL"
echo ""

# 1. Pick next topic
TOPIC=$(pick_next_topic)
SLUG=$(make_slug "$TOPIC")
TAGS=$(detect_tag "$TOPIC")
POST_FILE="$POSTS_DIR/$TODAY-$SLUG.md"

echo "  Topic: $TOPIC"
echo "  Slug:  $SLUG"
echo "  File:  $POST_FILE"
echo ""

if [[ -f "$POST_FILE" ]]; then
    echo "ERROR: Post file already exists: $POST_FILE" >&2
    exit 1
fi

if [[ "$DRY_RUN" == "--dry-run" ]]; then
    echo "[DRY RUN] Would generate post for: $TOPIC"
    exit 0
fi

# 2. Generate post via Ollama
echo "  Generating post via Bielik (this may take 2-5 minutes)..."
PROMPT=$(build_prompt "$TOPIC" "$SLUG" "$TAGS")

# Write prompt to temp file to avoid shell quoting issues
PROMPT_TMPFILE=$(mktemp)
echo "$PROMPT" > "$PROMPT_TMPFILE"

PAYLOAD_TMPFILE=$(mktemp)
python3 -c "
import json, sys
with open('$PROMPT_TMPFILE', 'r') as f:
    prompt = f.read()
payload = {
    'model': '$OLLAMA_MODEL',
    'prompt': prompt,
    'stream': False,
    'options': {'num_predict': 4096, 'temperature': 0.7}
}
with open('$PAYLOAD_TMPFILE', 'w') as f:
    json.dump(payload, f)
"

RESPONSE=$(curl -s "$OLLAMA_URL" -d @"$PAYLOAD_TMPFILE" 2>&1)
rm -f "$PROMPT_TMPFILE" "$PAYLOAD_TMPFILE"

RAW_CONTENT=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['response'])" 2>/dev/null)

if [[ -z "$RAW_CONTENT" ]]; then
    echo "ERROR: Ollama returned empty response. Is the model running?" >&2
    echo "Response: $RESPONSE" >&2
    exit 1
fi

# 3. Fix and save post
# Strip leading blank lines before frontmatter
RAW_CONTENT=$(echo "$RAW_CONTENT" | sed '/./,$!d')
CONTENT=$(fix_frontmatter "$RAW_CONTENT")

# Ensure CTA has correct links
if ! echo "$CONTENT" | grep -q "szybkafucha.app"; then
    CONTENT="$CONTENT

---

Potrzebujesz więcej porad? Odwiedź [BlogSzybkaFucha.app](https://blog.szybkafucha.app) lub znajdź fachowca w 5 minut na [SzybkaFucha.app](https://szybkafucha.app)."
fi

echo "$CONTENT" > "$POST_FILE"
echo "  Post saved: $POST_FILE"

# 4. Update backlog
ESCAPED_TOPIC=$(echo "$TOPIC" | sed 's/[[\.*^$()+?{|]/\\&/g')
sed -i '' "s/- \[ \] ${ESCAPED_TOPIC}/- [x] ${TOPIC} ✅ ${TODAY}/" "$BACKLOG"
echo "  Backlog updated."

# 5. Publish via daily-post.sh
echo ""
echo "  Running daily-post.sh..."
bash "$SCRIPT_DIR/daily-post.sh" "Post: $TOPIC ($TODAY)"

# 6. Post to Facebook
DESCRIPTION=$(grep '^description:' "$POST_FILE" | sed 's/^description: *"*//;s/"*$//' | head -1)
post_to_facebook "$TOPIC" "$DESCRIPTION" "$SLUG"

echo ""
echo "=== Done! ==="
