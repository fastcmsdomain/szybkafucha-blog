# Automatyzacja zdjęć OpenClaw

## Cel

Ten dokument opisuje dokładnie, jak w tym projekcie powstają obrazy do postów blogowych:

- kto uruchamia proces
- na jakim etapie używany jest `Replicate`
- jaki prompt jest budowany
- skąd biorą się dane do promptu
- jak obraz trafia do posta i na stronę główną bloga

Dotyczy to aktualnego pipeline w:

- `blog/scripts/generate-hero-image.mjs`
- `blog/scripts/daily-post.sh`
- `blog/scripts/build-posts.mjs`

## Krótka odpowiedź

OpenClaw nie generuje obrazu "sam z siebie" w modelu rozmowy. Technicznie działa to tak:

1. OpenClaw uruchamia skrypt Node `generate-hero-image.mjs`
2. skrypt czyta dane posta z pliku markdown
3. skrypt buduje prompt automatycznie z tytułu, opisu i tagów
4. skrypt wysyła request do API `Replicate`
5. `Replicate` generuje obraz
6. skrypt zapisuje plik do `blog/content/images/`
7. skrypt dopisuje pole `image:` do frontmatter posta
8. `npm run build` kopiuje obraz do `blog/public/images/`
9. pipeline może wygenerować też lżejsze warianty `webp` i `avif`
10. generator HTML automatycznie pokazuje obraz:
   - na stronie posta
   - na homepage bloga

Czyli:

- OpenClaw steruje procesem
- prompt powstaje automatycznie
- właściwe wygenerowanie obrazu robi `Replicate`

## Gdzie to jest skonfigurowane

### Sekrety i ustawienia lokalne

Plik:

- `blog/.env`

Przykład:

```bash
REPLICATE_API_TOKEN="r8_your_token_here"
BLOG_IMAGE_PROVIDER="replicate"
REPLICATE_IMAGE_MODEL="black-forest-labs/flux-schnell"
BLOG_AUTO_GENERATE_IMAGES="true"
```

Znaczenie:

- `REPLICATE_API_TOKEN` — lokalny token do API Replicate
- `BLOG_IMAGE_PROVIDER` — aktywny provider obrazów
- `REPLICATE_IMAGE_MODEL` — model używany przez Replicate
- `BLOG_AUTO_GENERATE_IMAGES` — czy `daily-post.sh` ma automatycznie tworzyć brakujące obrazy przed buildem

Plik `blog/.env` jest lokalny i nie powinien być commitowany.

## Główny skrypt generujący obraz

Plik:

- `blog/scripts/generate-hero-image.mjs`

Ten skrypt:

1. ładuje `blog/.env`
2. wybiera provider
3. znajduje post po `slug` albo nazwie pliku
4. czyta frontmatter i treść markdownu
5. buduje prompt
6. wysyła request do API
7. zapisuje wynik do `blog/content/images/`
8. aktualizuje frontmatter posta o pole `image`

## Jak budowany jest prompt

Prompt nie jest wpisywany ręcznie przy każdym poście. Skrypt tworzy go automatycznie.

Źródła danych:

- `title`
- `description` albo `excerpt`
- `tags` albo `category`

Logika promptu z kodu:

```text
Editorial hero image for a Polish DIY and home improvement blog article.
Topic: {title}.
Context: {description lub excerpt}.
Tags: {tags lub category}.
Create a realistic, clean, warm lifestyle scene.
Show the main task clearly, with natural light and practical home-or-garden details.
No text, no letters, no watermark, no logo, no UI, no split screen, no collage.
Cinematic wide composition, 16:9, suitable as a website hero image.
```

To znaczy, że OpenClaw nie wymyśla każdorazowo wolnego promptu od zera, tylko skrypt buduje stabilny prompt na podstawie danych posta.

## Przykład promptu

Dla posta `nieszczelnacy-kran` prompt wygląda praktycznie tak:

```text
Editorial hero image for a Polish DIY and home improvement blog article.
Topic: Jak naprawić nieszczelnący kran w 15 minut.
Context: Szybka i bezpieczna naprawa nieszczelnącego kranu — bez wymywania śmietnika.
Tags: dom, łazienka.
Create a realistic, clean, warm lifestyle scene.
Show the main task clearly, with natural light and practical home-or-garden details.
No text, no letters, no watermark, no logo, no UI, no split screen, no collage.
Cinematic wide composition, 16:9, suitable as a website hero image.
```

## Jaki model jest używany

Domyślnie:

- `black-forest-labs/flux-schnell`

Skąd:

- `REPLICATE_IMAGE_MODEL` w `blog/.env`

Jeśli nie ustawisz modelu, skrypt i tak domyślnie użyje:

- `black-forest-labs/flux-schnell`

To jest obecnie szybka i tania opcja startowa dla hero image bloga.

## Jak wygląda request do Replicate

Skrypt wykonuje `POST` do endpointu:

```text
https://api.replicate.com/v1/models/{owner}/{name}/predictions
```

Wysyłane dane:

```json
{
  "input": {
    "prompt": "...",
    "aspect_ratio": "16:9",
    "output_format": "jpg",
    "seed": 123456789
  }
}
```

Najważniejsze pola:

- `prompt` — zbudowany automatycznie opis sceny
- `aspect_ratio: 16:9` — format hero image
- `output_format: jpg` — wynik jako JPEG
- `seed` — deterministyczny seed liczony z `slug`

## Po co jest seed

Skrypt tworzy seed z `slug` posta.

Efekt:

- generacja jest bardziej powtarzalna
- ten sam post może dawać podobny kierunek obrazu
- łatwiej testować i porównywać wyniki

Jeśli chcesz, możesz ręcznie podać własny seed:

```bash
npm run image:hero -- --post komposter-domowy --seed 12345
```

## Jak obraz trafia do posta

Po udanej generacji skrypt:

1. zapisuje plik do:
   - `blog/content/images/YYYY-MM-DD-slug.jpg`
2. dopisuje lub aktualizuje pole:

```yaml
image: "YYYY-MM-DD-slug.jpg"
```

w pliku markdown posta.

To jest źródło prawdy dla obrazu.

## Jak obraz trafia na blog home page

To robi już build, nie generator obrazów.

Plik:

- `blog/scripts/build-posts.mjs`

Ten skrypt:

1. czyta frontmatter każdego posta
2. bierze `image`, `date`, `time`, `description`, `title`
3. buduje:
   - stronę pojedynczego posta
   - kartę na homepage
4. kopiuje obraz z:
   - `blog/content/images/`
   do:
   - `blog/public/images/`

Czyli homepage nie ma osobnego uploadu obrazów.

Homepage bierze obraz automatycznie z tego samego pola:

```yaml
image: "..."
```

Jeśli lokalnie albo w CI dostępne są narzędzia optymalizacji, pipeline tworzy też:

- `webp`
- `avif`

Są one podpinane przez `<picture>`, ale fallback `img` i meta social preview zostają na klasycznym obrazie źródłowym.

## Etap użycia Replicate w całym workflow

### Manualnie

Kolejność:

1. tworzysz `blog/content/posts/YYYY-MM-DD-slug.md`
2. uruchamiasz:

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run image:hero -- --post <slug>
```

3. skrypt generuje obraz przez `Replicate`
4. skrypt wpisuje `image:` do frontmatter
5. uruchamiasz:

```bash
npm run build
```

6. homepage i post dostają obraz

### Automatycznie przez OpenClaw

Kolejność:

1. OpenClaw tworzy markdown posta
2. OpenClaw uruchamia:

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh
```

3. `daily-post.sh` ładuje `blog/.env`
4. jeśli:
   - `BLOG_AUTO_GENERATE_IMAGES="true"`
   - provider to `replicate`
   - `REPLICATE_API_TOKEN` istnieje

   to skrypt uruchamia:

```bash
npm run image:hero -- --missing --provider replicate
```

5. generator tworzy obrazy dla wszystkich postów, które nie mają lokalnego pliku obrazu
6. jeśli dostępne są narzędzia lokalne, `daily-post.sh` generuje też warianty `webp/avif`
7. potem `daily-post.sh` uruchamia:

```bash
npm run build
```

8. następnie commit i push
9. GitHub Actions publikuje nowy build

## Co oznacza `--missing`

Tryb:

```bash
npm run image:hero -- --missing
```

oznacza:

- przejdź po wszystkich markdownach w `blog/content/posts/`
- sprawdź, czy post ma obraz lokalny
- jeśli nie ma, wygeneruj go

To jest najważniejszy tryb dla automatyzacji OpenClaw.

## Najprostsze i najszybsze sposoby pracy

### 1. Najszybszy manualny test jednego posta

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run image:hero -- --post komposter-domowy
npm run build
```

Użyj, gdy chcesz szybko sprawdzić jakość jednego obrazu.

### 2. Najprostsza automatyzacja pełnego publishu

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh
```

Użyj, gdy chcesz:

- wygenerować brakujące obrazy
- zbudować blog
- zrobić commit i push

### 3. Najbezpieczniejszy podgląd bez kosztu API

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run image:hero -- --missing --dry-run
```

To nie generuje obrazów. Pokazuje tylko:

- które posty zostałyby przetworzone
- jaki provider byłby użyty
- jaki prompt zostałby wysłany

## Jak OpenClaw powinien tego używać

Jeśli uruchamiasz OpenClaw z promptu zadaniowego, najlepszy flow jest taki:

1. wybierz temat
2. utwórz markdown
3. uzupełnij frontmatter:
   - `title`
   - `date`
   - `slug`
   - `description`
   - `time`
   - `cost`
   - `difficulty`
   - `tags`
4. uruchom `daily-post.sh`

Wtedy obraz powstaje automatycznie bez ręcznego podawania promptu do generatora.

## Warunki, żeby automatyzacja działała dobrze

Post powinien mieć sensowny frontmatter. Szczególnie:

- `title`
- `description` albo `excerpt`
- `tags` albo `category`
- `date`
- `slug`

Jeśli tych pól nie ma, prompt będzie uboższy, a homepage może stracić część danych karty.

## Co nie działa "magicznie"

- OpenClaw nie wysyła obrazu do posta bezpośrednio z rozmowy
- homepage nie ma osobnego uploadu obrazka
- nie trzeba ręcznie edytować `blog/public/index.html`
- nie trzeba ręcznie edytować `blog/public/blog/*.html`

Wszystko idzie przez:

- markdown frontmatter
- generator obrazu
- build

## Gdzie zapisywany jest wynik

### Źródło

- `blog/content/images/*.jpg`

### Wygenerowany build

- `blog/public/images/*.jpg`

### Post source

- `blog/content/posts/*.md`

### Post HTML

- `blog/public/blog/*.html`

### Homepage

- `blog/public/index.html`

## Checklista debugowania

Jeśli obraz nie pojawia się na homepage albo poście:

1. sprawdź, czy markdown ma:

```yaml
image: "YYYY-MM-DD-slug.jpg"
```

2. sprawdź, czy plik istnieje w:

- `blog/content/images/`

3. uruchom:

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run build
```

4. sprawdź, czy plik został skopiowany do:

- `blog/public/images/`

5. sprawdź, czy homepage karta ma `<img src="images/...">`
6. sprawdź, czy post ma `article-cover`

## Najważniejsze komendy

### Jeden post

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run image:hero -- --post nieszczelnacy-kran
npm run build
```

### Wszystkie brakujące obrazy

```bash
cd /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog
npm run image:hero -- --missing
```

### Pełna automatyzacja OpenClaw

```bash
bash /Users/simacbook/.openclaw/workspace/SzybkaFuchaApp/blog/scripts/daily-post.sh
```

## Podsumowanie

Najkrócej:

- OpenClaw uruchamia skrypt
- skrypt buduje prompt automatycznie z frontmatter i treści posta
- `Replicate` generuje obraz
- obraz trafia do `content/images`
- frontmatter dostaje `image:`
- build pokazuje obraz na stronie posta i na homepage

To jest aktualny mechanizm działania automatyzacji zdjęć w tym projekcie.
