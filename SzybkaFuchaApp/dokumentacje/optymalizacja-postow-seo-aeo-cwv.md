# Optymalizacja postów: SEO, AEO, GEO, Core Web Vitals

## Zakres

Ten dokument opisuje porządki i optymalizacje wdrożone w szablonie postów bloga.

Dotyczy:

- `blog/templates/post.html`
- `blog/scripts/build-posts.mjs`
- `blog/templates/index.html`

## Usunięte pliki zbędne

Usunięty został nieużywany plik:

- `blog/templates/post-exmple.html`

Powód:

- nie był używany przez build
- dublował `post.html`
- zawierał stare adresy i przykładowe zasoby
- zwiększał ryzyko, że kolejne zmiany trafią do złego pliku

## Co zostało zoptymalizowane

### 1. Crawlability i linkowanie

Homepage cards są teraz prawdziwymi linkami:

- wcześniej: klikany `div` z `onclick`
- teraz: semantyczny `<a href="...">`

To poprawia:

- SEO crawlability
- dostępność klawiaturą
- interpretację linków przez roboty i systemy odpowiedzi

### 2. Core Web Vitals i CLS

Obrazy kart i hero image dostają teraz:

- `width`
- `height`
- `decoding="async"`

Hero image dostaje dodatkowo:

- `fetchpriority="high"`
- `rel="preload"` w `<head>`

To ogranicza:

- CLS
- opóźnienia LCP

### 3. SEO techniczne

Posty mają pełniejsze meta dane:

- `title`
- `description`
- `canonical`
- `author`
- `og:title`
- `og:description`
- `og:url`
- `og:image`
- `og:image:width`
- `og:image:height`
- `twitter:card`
- `twitter:image`
- `article:published_time`
- `article:modified_time`
- `article:tag`

### 4. Structured data

Dodane zostały JSON-LD:

- `BlogPosting`
- `BreadcrumbList`

To wzmacnia rozumienie strony przez:

- wyszukiwarki
- systemy answer engines
- modele, które analizują strukturę treści i encje na stronie

### 5. AEO i GEO

W praktyce dla tego projektu AEO i GEO są wspierane przez:

- semantyczny nagłówek `h1`
- jasny lead nad treścią
- logiczne `h2/h3`
- stabilne breadcrumbs
- strukturalne dane `BlogPosting`
- crawlable linki wewnętrzne
- spójne meta opisy i tagi

To nie daje "gwarancji rankingu", ale poprawia czytelność strony dla systemów odpowiedzi i ekstrakcji wiedzy.

### 6. Dostępność i WCAG 2.2

Dodane lub utrzymane:

- `skip-link`
- semantyczne `nav`
- `aria-label` dla menu i kart
- `:focus-visible` dla linków i buttonów
- wsparcie `prefers-reduced-motion`
- prawdziwe linki zamiast click handlerów na `div`

### 7. Performance

W postach usunięto zależność od zewnętrznych fontów Google z samego template’u postów.

To redukuje:

- dodatkowe requesty do third-party
- render-blocking zależności
- ryzyko pogorszenia LCP i prywatności

## Co to daje realnie

Najważniejsze efekty:

- mniej redundantnych plików
- lepsza indeksowalność postów
- lepsze zrozumienie strony przez roboty i answer engines
- lepszy foundation pod Lighthouse
- mniejsze ryzyko CLS na obrazach
- bardziej semantyczny i dostępny HTML

## Czego nie da się uczciwie zagwarantować

Nie da się uczciwie zagwarantować "100/100" dla:

- Performance
- SEO
- Best Practices
- Accessibility

bez rzeczywistego pomiaru Lighthouse na:

- lokalnym preview
- środowisku live
- konkretnym urządzeniu i throttlingu

Na wynik wpływają też:

- hosting
- cache
- rozmiary obrazów
- sieć
- skrypty zewnętrzne
- rozmiar HTML/CSS po dalszym rozwoju

Czyli:

- można wdrożyć bardzo dobre praktyki
- ale wynik 100% trzeba zmierzyć, nie zadeklarować

## Co jeszcze można zrobić dalej

Kolejne rozsądne kroki:

1. skompresować istniejące obrazy i dodać warianty `webp` lub `avif`
2. dodać automatyczne generowanie `meta description` i tagów jakości, jeśli frontmatter jest niepełny
3. dodać `FAQPage` structured data dla postów, które mają sekcję pytań i odpowiedzi
4. dodać pomiar Lighthouse / PageSpeed do workflow testowego
5. ujednolicić source of truth dla homepage i docs, jeśli `docs/index.html` ma jeszcze starą logikę

## Wniosek

Wdrożone zmiany tworzą dobry fundament pod:

- SEO
- AEO
- GEO
- Core Web Vitals
- WCAG 2.2

Najważniejsze: strona jest teraz bardziej semantyczna, szybsza w renderze obrazów, lepiej zlinkowana i łatwiejsza do zrozumienia dla wyszukiwarek oraz systemów odpowiedzi.
