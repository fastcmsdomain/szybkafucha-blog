# SzybkaFucha Blog — Automatyzacja Publikacji

> READY-TO-USE dokument operacyjny. Wszystko co potrzebujesz do uruchamiania, zarządzania i rozwiązywania problemów z automatycznym blogiem.

---

## Architektura systemu

```
topics-backlog.md          <- lista tematow (dom / ogrod)
        |
        v
generate-and-publish.sh    <- glowny skrypt automatyzacji
        |
        +---> Ollama API (Bielik 11B)     -> generuje tekst posta (.md)
        +---> daily-post.sh
        |       +---> Replicate API        -> generuje hero image (.jpg)
        |       +---> npm run build        -> buduje HTML
        |       +---> git push             -> deploy na GitHub Pages
        +---> Facebook Graph API           -> publikuje na FB Page
```

### Technologie

| Komponent | Technologia | Lokalizacja |
|-----------|-------------|-------------|
| Tekst posta | Bielik 11B v3.0 (Ollama, lokalny) | `http://127.0.0.1:11434` |
| Hero image | Flux Schnell (Replicate API) | cloud |
| Build HTML | Node.js (build-posts.mjs) | lokalny |
| Hosting bloga | GitHub Pages | `https://blog.szybkafucha.app` |
| Facebook | Graph API v19.0 | cloud |
| Scheduler | OpenClaw cron | lokalny (`openclaw-gateway`) |

---

## 1. Automatyzacja schedulowana (cron)

### Aktualny harmonogram

| Dzien | Godzina | Timezone |
|-------|---------|----------|
| Poniedzialek | 9:00 | Europe/Warsaw |
| Sroda | 9:00 | Europe/Warsaw |
| Piatek | 9:00 | Europe/Warsaw |

Cron expression: `0 9 * * 1,3,5`

### Wymagania do dzialania crona

Aby automatyzacja dzialala bez nadzoru, te procesy musza byc uruchomione:

```bash
# 1. Ollama (hosting modelu Bielik)
ollama serve

# 2. OpenClaw Gateway (scheduler cron)
openclaw daemon start
```

### Zarzadzanie cronem

```bash
# Podglad harmonogramu
openclaw cron list

# Reczne uruchomienie (test)
openclaw cron run blog-post-generator

# Wylaczenie (np. na urlop)
openclaw cron disable blog-post-generator

# Wlaczenie
openclaw cron enable blog-post-generator

# Zmiana harmonogramu (np. codziennie o 8:00)
openclaw cron edit blog-post-generator --cron "0 8 * * *"

# Zmiana na pon/wt/sr/czw/pt o 9:00
openclaw cron edit blog-post-generator --cron "0 9 * * 1-5"

# Usuniecie
openclaw cron rm blog-post-generator
```

### Dodanie nowego crona od zera

```bash
openclaw cron add \
  --name "blog-post-generator" \
  --description "Generate and publish blog post via Bielik + Replicate + Facebook" \
  --cron "0 9 * * 1,3,5" \
  --tz "Europe/Warsaw" \
  --agent main \
  --message "Run: bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/generate-and-publish.sh" \
  --timeout-seconds 900 \
  --exact
```

---

## 2. Reczne uruchomienie

### Pelny pipeline (generuj + publikuj + Facebook)

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/generate-and-publish.sh
```

Co sie stanie:
1. Wybierze nastepny temat z backlogu (rotacja dom/ogrod)
2. Wygeneruje post przez Bielik (~2-5 min)
3. Wygeneruje hero image przez Replicate (~10-30s)
4. Zbuduje HTML
5. Git push na master -> GitHub Pages deploy
6. Opublikuje na Facebook Page

### Podglad bez generowania (dry-run)

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/generate-and-publish.sh --dry-run
```

Output:
```
=== Blog Post Generator & Publisher ===
    Date: 2026-03-07
    Model: SpeakLeash/bielik-11b-v3.0-instruct:Q4_K_M

  Topic: Jak wymienić glazurę w łazience
  Slug:  wymienic-glazure-lazience
  File:  .../content/posts/2026-03-07-wymienic-glazure-lazience.md

[DRY RUN] Would generate post for: Jak wymienić glazurę w łazience
```

### Tylko publikacja (bez generowania tekstu)

Jezeli post juz istnieje w `content/posts/` i chcesz tylko zbudowac + push + FB:

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
bash scripts/daily-post.sh "Post: Nazwa posta (2026-03-07)"
```

### Tylko Facebook (bez generowania i publikacji)

```bash
source /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/.env

curl -s -X POST "https://graph.facebook.com/v19.0/${FB_PAGE_ID}/feed" \
  --data-urlencode "message=Tytul posta

Opis posta

Czytaj caly artykul: https://blog.szybkafucha.app/blog/SLUG.html

#SzybkaFucha #DIY #PoradyDomowe #ZrobToSam" \
  -d "link=https://blog.szybkafucha.app/blog/SLUG.html" \
  -d "access_token=$FB_PAGE_ACCESS_TOKEN"
```

---

## 3. Pliki i sciezki

### Skrypty

| Plik | Cel |
|------|-----|
| `blog/scripts/generate-and-publish.sh` | Glowny skrypt: tekst + image + build + push + FB |
| `blog/scripts/daily-post.sh` | Publikacja: image + build + push |
| `blog/scripts/build-posts.mjs` | Budowanie HTML z Markdown |
| `blog/scripts/generate-hero-image.mjs` | Generowanie hero image (Replicate) |
| `blog/scripts/optimize-images.mjs` | Optymalizacja obrazow (opcjonalna) |

### Dane

| Plik | Cel |
|------|-----|
| `blog/docs/topics-backlog.md` | Lista tematow do napisania |
| `blog/BOOT.md` | Zasady struktury artykulow |
| `blog/.env` | Sekrety (Replicate token, FB token) |
| `blog/content/posts/*.md` | Wygenerowane posty (Markdown + YAML) |
| `blog/content/images/*.jpg` | Wygenerowane hero images |
| `blog/public/blog/*.html` | Zbudowane strony HTML |

### Konfiguracja OpenClaw

| Plik | Cel |
|------|-----|
| `~/.openclaw/openclaw.json` | Glowna konfiguracja (model, gateway, cron) |
| `~/.openclaw/agents/main/agent/auth-profiles.json` | Klucze API (Ollama, OpenRouter) |

---

## 4. Sekrety (.env)

Plik: `/Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/.env`

```bash
# Replicate — generowanie hero images
REPLICATE_API_TOKEN="r8_..."
BLOG_IMAGE_PROVIDER="replicate"
REPLICATE_IMAGE_MODEL="black-forest-labs/flux-schnell"
BLOG_AUTO_GENERATE_IMAGES="true"

# Facebook — auto-posting na strone
FB_PAGE_ID="864282246779225"
FB_PAGE_ACCESS_TOKEN="EAAazn..."
```

**WAZNE:** `.env` NIE jest commitowany do git (jest w `.gitignore`). Tokeny trzymaj tylko lokalnie.

---

## 5. Logika wyboru tematow

### Rotacja

Skrypt alternuje miedzy sekcjami DOM i OGROD:
- Ostatni post z DOM -> nastepny z OGROD
- Ostatni post z OGROD -> nastepny z DOM

### Tematy pomijane (safety)

Skrypt automatycznie pomija tematy zawierajace:
- `elektryczn*` — prace z pradem 230V
- `gazow*` — instalacje gazowe
- `konstrukcyjn*` — prace strukturalne
- `azbestow*` — azbest
- `dach*` — praca na wysokosci

Te tematy wymagaja profesjonalisty i nie powinny byc poradami DIY.

### Dodawanie nowych tematow

Edytuj `blog/docs/topics-backlog.md`:

```markdown
## DOM (Home) Topics
- [ ] Nowy temat domowy

## OGROD (Garden) Topics
- [ ] Nowy temat ogrodowy
```

---

## 6. Struktura generowanego posta

```
content/posts/2026-03-06-zatkany-odplyw.md
content/images/2026-03-06-zatkany-odplyw.jpg
public/blog/zatkany-odplyw.html
```

### Frontmatter (YAML)

```yaml
---
title: "Jak wyczyscic zatkany odplyw w 15 minut"
date: "2026-03-06"
slug: "zatkany-odplyw"
image: "2026-03-06-zatkany-odplyw.jpg"
description: "Krotki opis artykulu"
difficulty: 1
time: "15-20 minut"
cost: "0-50 zl"
tags: ["dom", "lazienka"]
---
```

### Sekcje artykulu

1. Wstep (2-3 zdania)
2. Dlaczego warto to wiedziec?
3. Potrzebne narzedzia i materialy (lista z cenami)
4. Instrukcja krok po kroku (numerowana)
5. Czeste bledy (lista punktowana)
6. Uwaga dotyczaca bezpieczenstwa
7. CTA: link do blog.szybkafucha.app i szybkafucha.app

### Post na Facebooku

```
Tytul artykulu

Opis artykulu

Czytaj caly artykul: https://blog.szybkafucha.app/blog/slug.html

#SzybkaFucha #DIY #PoradyDomowe #ZrobToSam
```

---

## 7. Opublikowane posty

| Data | Temat | Kategoria | Blog | Facebook |
|------|-------|-----------|------|----------|
| 2026-02-27 | Jak naprawic nieszczelnacy kran | DOM | tak | - |
| 2026-02-28 | Jak uprawiac pomidory na balkonie | OGROD | tak | - |
| 2026-02-29 | Jak zalepic pekniecie w scianie gipsowej | DOM | tak | - |
| 2026-03-01 | Jak zrobic komposter domowy | OGROD | tak | - |
| 2026-03-06 | Jak wyczyscic zatkany odplyw | DOM | tak | tak |
| 2026-03-06 | Jak pozbyc sie chwastow naturalnie | OGROD | tak | - |

---

## 8. Rozwiazywanie problemow

### Ollama nie odpowiada

```bash
# Sprawdz
curl -s http://127.0.0.1:11434/api/tags | python3 -m json.tool

# Uruchom
ollama serve

# Sprawdz czy model jest pobrany
ollama list | grep bielik-11b
# Jezeli nie:
ollama pull SpeakLeash/bielik-11b-v3.0-instruct:Q4_K_M
```

### OpenClaw gateway nie dziala

```bash
# Sprawdz
ps aux | grep openclaw-gateway

# Restart
pkill -f openclaw-gateway
openclaw daemon start

# Logi
openclaw logs --follow
```

### Facebook: token wygasl

Token Page Access Token wygasa po ~60 dniach. Aby odnowic:

```bash
# 1. Wygeneruj nowy User Token w Graph API Explorer
#    (developers.facebook.com -> Tools -> Graph API Explorer)
#    Aplikacja: SzybkaFucha Blog Publisher
#    Permissions: pages_manage_posts, pages_read_engagement, pages_read_user_content

# 2. Pobierz nowy Page Token:
curl -s "https://graph.facebook.com/v19.0/me/accounts?access_token=NOWY_USER_TOKEN"
# Skopiuj "access_token" z odpowiedzi

# 3. Zaktualizuj .env:
#    FB_PAGE_ACCESS_TOKEN="nowy_page_token"
```

### Post juz istnieje (ten sam dzien)

Skrypt nie nadpisuje istniejacych postow. Opcje:
- Usun plik: `rm content/posts/2026-03-06-slug.md`
- Poczekaj do nastepnego dnia

### Bielik generuje zly frontmatter

Skrypt automatycznie:
- Usuwa `**` (bold) z frontmatter
- Dodaje CTA z linkami jezeli Bielik go pominal

Jezeli post wymaga recznej poprawki — edytuj `.md` i uruchom:
```bash
bash scripts/daily-post.sh "Fix: nazwa posta"
```

### Brak tematow w backlogu

```
ERROR: No more topics in backlog!
```

Dodaj nowe tematy do `blog/docs/topics-backlog.md`.

---

## 9. Koszty

| Usluga | Koszt | Czestotliwosc |
|--------|-------|---------------|
| Bielik (Ollama) | 0 zl (lokalny) | kazdy post |
| Replicate (hero image) | ~$0.003/image | kazdy post |
| GitHub Pages | 0 zl | hosting |
| Facebook Graph API | 0 zl | kazdy post |
| **Lacznie** | **~$0.01/post (~0.04 zl)** | **3x/tydzien** |

Miesiecznie: ~12 postow x $0.01 = **~$0.12/miesiac (~0.50 zl)**

---

## 10. Quick reference

```bash
# === CODZIENNE KOMENDY ===

# Podglad nastepnego tematu
bash scripts/generate-and-publish.sh --dry-run

# Generuj i publikuj teraz
bash scripts/generate-and-publish.sh

# Tylko build + push (bez generowania)
bash scripts/daily-post.sh "Post: Tytul"

# === CRON ===

# Status
openclaw cron list

# Test crona
openclaw cron run blog-post-generator

# Wlacz/wylacz
openclaw cron enable blog-post-generator
openclaw cron disable blog-post-generator

# === DIAGNOSTYKA ===

# Ollama
curl -s http://127.0.0.1:11434/api/tags

# Gateway
openclaw logs --follow

# Facebook token
curl -s "https://graph.facebook.com/v19.0/me?access_token=$(grep FB_PAGE_ACCESS_TOKEN .env | cut -d'"' -f2)"
```

---

_Ostatnia aktualizacja: 2026-03-06_
_System: Bielik 11B v3.0 + Replicate Flux + GitHub Pages + Facebook Graph API_
