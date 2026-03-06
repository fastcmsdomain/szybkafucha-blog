# generate-and-publish.sh — Dokumentacja

## Co robi skrypt?

Automatycznie generuje post blogowy w języku polskim za pomocą modelu Bielik (Ollama), publikuje go na GitHub Pages i udostępnia na Facebooku.

## Pełny workflow

```
1. Czyta topics-backlog.md → wybiera następny temat (rotacja dom/ogród)
2. Pomija tematy z listy bezpieczeństwa (230V, gaz, azbest, dach)
3. Wysyła prompt do Bielik 11B (Ollama API) → generuje artykuł markdown
4. Zapisuje post do content/posts/YYYY-MM-DD-slug.md
5. Aktualizuje backlog (oznacza temat jako ukończony ✅)
6. Uruchamia daily-post.sh:
   - Generuje hero image (Replicate API)
   - Buduje HTML (npm run build)
   - Git commit + push → GitHub Pages
7. Publikuje skrót na Facebook Page (jeśli token ustawiony)
```

## Uruchamianie

### Ręczne
```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
bash scripts/generate-and-publish.sh
```

### Dry run (podgląd bez generowania)
```bash
bash scripts/generate-and-publish.sh --dry-run
```

### Automatyczne (cron via OpenClaw)
Cron ustawiony: **poniedziałek, środa, piątek o 9:00** (Europe/Warsaw)

```bash
# Podgląd crona
openclaw cron list

# Ręczne uruchomienie crona (test)
openclaw cron run blog-post-generator

# Wyłączenie crona
openclaw cron disable blog-post-generator

# Włączenie crona
openclaw cron enable blog-post-generator
```

## Wymagania

### Procesy
| Proces | Cel | Sprawdzenie |
|--------|-----|-------------|
| Ollama | Hosting modelu Bielik | `curl http://127.0.0.1:11434/api/tags` |
| openclaw-gateway | Cron scheduler | `ps aux \| grep openclaw-gateway` |

### Model
```bash
# Sprawdź czy Bielik jest pobrany
ollama list | grep bielik-11b

# Jeśli nie — pobierz (~6.7GB)
ollama pull SpeakLeash/bielik-11b-v3.0-instruct:Q4_K_M
```

### Zmienne środowiskowe (.env)

Plik: `blog/.env`

| Zmienna | Wymagana | Opis |
|---------|----------|------|
| `REPLICATE_API_TOKEN` | Tak | Token do generowania hero images |
| `BLOG_IMAGE_PROVIDER` | Tak | `replicate` (domyślnie) |
| `BLOG_AUTO_GENERATE_IMAGES` | Nie | `true` (domyślnie) |
| `FB_PAGE_ID` | Nie* | ID strony Facebook |
| `FB_PAGE_ACCESS_TOKEN` | Nie* | Page Access Token z uprawnieniami `pages_manage_posts` |

*Bez tych zmiennych skrypt działa, ale pomija postowanie na Facebooku.

### Zmienne opcjonalne (override)

| Zmienna | Domyślna | Opis |
|---------|----------|------|
| `OLLAMA_URL` | `http://127.0.0.1:11434/api/generate` | Endpoint Ollama API |
| `OLLAMA_MODEL` | `SpeakLeash/bielik-11b-v3.0-instruct:Q4_K_M` | Model do generowania |

## Pliki wejściowe

| Plik | Ścieżka | Opis |
|------|---------|------|
| Backlog tematów | `blog/docs/topics-backlog.md` | Lista tematów do napisania |
| Konstytucja agenta | `blog/BOOT.md` | Zasady struktury artykułów |
| Skrypt publikacji | `blog/scripts/daily-post.sh` | Build + git push |

## Pliki wyjściowe

| Plik | Ścieżka | Opis |
|------|---------|------|
| Post markdown | `blog/content/posts/YYYY-MM-DD-slug.md` | Wygenerowany artykuł |
| Hero image | `blog/content/images/YYYY-MM-DD-slug.jpg` | Wygenerowany przez Replicate |
| HTML | `blog/public/blog/slug.html` | Zbudowany post |

## Logika wyboru tematu

1. Sprawdza datę ostatniego posta w sekcji DOM i OGRÓD
2. Wybiera sekcję z **starszą** datą (rotacja 50/50)
3. Bierze pierwszy niezaznaczony temat `- [ ]` z tej sekcji
4. Pomija tematy z listy bezpieczeństwa:
   - `elektryczn*` (prąd 230V)
   - `gazow*` (instalacje gazowe)
   - `konstrukcyjn*` (prace strukturalne)
   - `azbestow*` (azbest)
   - `dach*` (praca na wysokości)
5. Jeśli brak tematów w wybranej sekcji → próbuje drugą sekcję
6. Jeśli brak tematów w obu sekcjach → ERROR, exit 1

## Struktura generowanego posta

```markdown
---
title: "Tytuł artykułu"
date: "2026-03-06"
slug: "slug-artykulu"
image: "2026-03-06-slug-artykulu.jpg"
description: "Krótki opis"
difficulty: 1
time: "15-20 minut"
cost: "0-50 zł"
tags: ["dom", "naprawy"]
---

## Wstęp
## Dlaczego warto to wiedzieć?
## Potrzebne narzędzia i materiały
## Instrukcja krok po kroku
## Częste błędy
## Uwaga dotycząca bezpieczeństwa

---
CTA z linkami do szybkafucha.app
```

## Post na Facebooku

Format posta:
```
Tytuł artykułu

Opis artykułu

Czytaj cały artykuł: https://blog.szybkafucha.app/blog/slug.html

#SzybkaFucha #DIY #PoradyDomowe #ZróbToSam
```

### Token Facebook — ważne

- Page Access Token wygasa po **~60 dniach**
- Aby odnowić: Graph API Explorer → wybierz aplikację SzybkaFucha Blog Publisher → Generate Access Token → pobierz nowy Page Token przez `me/accounts`
- Zaktualizuj `FB_PAGE_ACCESS_TOKEN` w `.env`

## Czas wykonania

| Krok | Czas |
|------|------|
| Generowanie tekstu (Bielik 11B) | 2-5 minut |
| Generowanie obrazu (Replicate) | 10-30 sekund |
| Build HTML | 1-2 sekundy |
| Git push | 2-5 sekund |
| Facebook post | 1-2 sekundy |
| **Łącznie** | **3-6 minut** |

## Rozwiązywanie problemów

### Ollama nie odpowiada
```bash
# Sprawdź czy działa
curl http://127.0.0.1:11434/api/tags

# Uruchom jeśli nie
ollama serve
```

### Timeout przy generowaniu
Model Bielik 11B na słabszym sprzęcie może być wolny. Opcje:
- Użyj mniejszego modelu: `OLLAMA_MODEL=bielik-content:latest` (szybszy, ale gorsza jakość)
- Zwiększ timeout w curl (domyślnie brak limitu)

### Facebook: "Key limit exceeded" lub "Permission denied"
- Wygeneruj nowy token (stary wygasł)
- Sprawdź uprawnienia: `pages_manage_posts`, `pages_read_engagement`

### Post already exists
Skrypt nie nadpisuje istniejących postów. Jeśli plik `YYYY-MM-DD-slug.md` już istnieje, skrypt przerywa z błędem. Usuń plik lub uruchom następnego dnia.

### Brak tematów w backlogu
Dodaj nowe tematy do `blog/docs/topics-backlog.md` w formacie:
```markdown
- [ ] Nowy temat do napisania
```
