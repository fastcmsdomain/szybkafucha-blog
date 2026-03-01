# Audyt Lighthouse i optymalizacja obrazów

## Cel

Ten dokument opisuje dwa nowe elementy pipeline:

1. automatyczne generowanie lżejszych wariantów obrazów `webp` i `avif`
2. automatyczny audyt Lighthouse dla homepage i wszystkich wygenerowanych postów

## Co zostało dodane

### Skrypty projektu

- `blog/scripts/optimize-images.mjs`
- `blog/scripts/audit-lighthouse.mjs`

### Nowe komendy npm

W [blog/package.json](/Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/package.json):

- `npm run images:optimize`
- `npm run audit:lighthouse`

### Workflow GitHub Actions

W repo root:

- [/Users/simacbook/.openclaw/workspace/.github/workflows/pages.yml](/Users/simacbook/.openclaw/workspace/.github/workflows/pages.yml)
- [/Users/simacbook/.openclaw/workspace/.github/workflows/lighthouse.yml](/Users/simacbook/.openclaw/workspace/.github/workflows/lighthouse.yml)

## Jak działa optymalizacja obrazów

### Źródła

Źródłowe obrazy nadal trzymamy w:

- [blog/content/images](/Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/content/images)

### Warianty pochodne

Wygenerowane warianty są zapisywane lokalnie do:

- `blog/.cache/image-variants`

Ten katalog jest ignorowany przez git i nie jest źródłem prawdy.

### Format działania

Skrypt:

- znajduje pliki `jpg`, `jpeg`, `png`
- jeśli dostępny jest `cwebp`, generuje `webp`
- jeśli dostępny jest `avifenc`, generuje `avif`
- nie nadpisuje świeżych plików bez potrzeby

### Komenda ręczna

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run images:optimize
```

### Automatyzacja w OpenClaw

`daily-post.sh` uruchamia optymalizację automatycznie przed buildem:

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh
```

Jeśli lokalnie nie ma `cwebp` ani `avifenc`, skrypt kończy się informacyjnie i publikuje dalej bez wariantów.

### Automatyzacja w GitHub Actions

Workflow Pages instaluje:

- `webp`
- `libavif-bin`

a następnie uruchamia:

```bash
npm run images:optimize
npm run build
```

To jest ważne, bo dzięki temu live deploy na GitHub Pages ma warianty `webp/avif` nawet wtedy, gdy lokalna maszyna ich nie wygenerowała.

## Jak generator HTML korzysta z wariantów

Generator w [build-posts.mjs](/Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/build-posts.mjs):

- kopiuje oryginalny obraz do `blog/public/images`
- jeśli istnieje `avif` lub `webp`, kopiuje też warianty
- renderuje `<picture>`
- ustawia fallback `<img>` na oryginalny plik

To dotyczy:

- hero image na stronie posta
- miniaturki na homepage

### Dlaczego fallback zostaje na oryginale

`og:image` i `twitter:image` nadal wskazują oryginalny obraz `jpg/png`, bo kompatybilność social preview dla `avif` i części `webp` bywa gorsza niż dla klasycznych formatów.

## Jak działa audit Lighthouse

Skrypt [audit-lighthouse.mjs](/Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/audit-lighthouse.mjs):

1. bierze gotowy build z `blog/public`
2. uruchamia lokalny serwer `python3 -m http.server`
3. odpala Lighthouse dla:
   - homepage `/`
   - każdego pliku `blog/public/blog/*.html`
4. zapisuje raporty do:
   - `blog/audit/lighthouse/*.report.html`
   - `blog/audit/lighthouse/*.report.json`
   - `blog/audit/lighthouse/summary.json`

### Komenda ręczna

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run build
npm run audit:lighthouse
```

### Workflow automatyczny

Workflow `Lighthouse Audit`:

- buduje blog
- generuje warianty obrazów
- uruchamia Lighthouse
- publikuje raporty jako artifact `lighthouse-reports`

## Co mierzy Lighthouse

Aktualnie audit zbiera kategorie:

- `performance`
- `accessibility`
- `best-practices`
- `seo`

## Co oznacza „PageSpeed”

W tej implementacji automatyzujemy Lighthouse, bo jest deterministyczny i nadaje się do CI.

`PageSpeed Insights` to osobna usługa Google oparta o Lighthouse i dane polowe, ale:

- wymaga wywołań zewnętrznych
- może mieć limity lub zmienność wyników
- nie jest tak stabilny do każdego pushu jak lokalny audit w CI

Czyli:

- automatyczny audit w repo = Lighthouse
- manualna walidacja live = PageSpeed Insights na publicznym URL

## Rekomendowane progi

Rozsądne cele:

- `SEO >= 95`
- `Accessibility >= 95`
- `Best Practices >= 95`
- `Performance >= 90`

Nie ustawiałem jeszcze failowania pipeline przy konkretnym progu, bo najpierw trzeba zebrać realne wyniki i zobaczyć, gdzie są naturalne wahania.

## Ograniczenia

### Lokalna maszyna

Jeśli lokalnie nie masz:

- `cwebp`
- `avifenc`
- `lighthouse`

to część komend nie uruchomi się w pełni lokalnie.

### CI i live deploy

W GitHub Actions te zależności są instalowane automatycznie, więc:

- obrazki będą optymalizowane w deployu
- audit będzie wykonywany w CI

## Najkrótszy workflow

### Ręcznie

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run images:optimize
npm run build
npm run audit:lighthouse
```

### Automatycznie przez OpenClaw

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh
```

### Automatycznie przez GitHub

Push na `master` uruchamia:

1. deploy Pages
2. osobny audit Lighthouse

## Wniosek

Po tej zmianie projekt ma:

- automatyczne `webp/avif`
- bezpieczny fallback do oryginalnych obrazów
- automatyczny audit Lighthouse w CI
- raporty do dalszej optymalizacji

To daje realną, mierzalną bazę pod CWV, SEO i dostępność, zamiast deklaracji bez pomiaru.
