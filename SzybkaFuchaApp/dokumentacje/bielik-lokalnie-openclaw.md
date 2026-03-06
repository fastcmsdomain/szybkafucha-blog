# Bielik lokalnie do tworzenia treści i marketingu

## Cel

Ten dokument opisuje praktyczny setup dla:

- komputera z procesorem `2.2 GHz 6-Core Intel Core i7`
- użycia tylko do:
  - tworzenia treści
  - draftów postów
  - marketingowych copy
- pracy z OpenClaw tak, żeby lokalny model służył tylko do pisania tekstu, a nie do całej automatyzacji agentowej

## Krótka rekomendacja

Dla Twojego komputera i tego use case najlepiej zacząć od:

- `speakleash/Bielik-4.5B-v3.0-Instruct-GGUF`

Jeśli chcesz wskazać konkretny plik GGUF, najlepszy punkt startowy to:

- `Bielik-4.5B-v3.0-Instruct.Q8_0.gguf`

Dlaczego ten wariant:

- jest wyraźnie lżejszy niż `11B`
- nadal należy do nowszej linii `v3.0 Instruct`
- do polskich draftów blogowych i marketingowych jest bardziej realistyczny lokalnie na Intel Macu
- łatwiej go uruchomić niż cięższe modele

## Dlaczego nie 11B jako pierwszy wybór

`11B` może dać lepszą jakość, ale na Twoim Intel Macu będzie zwykle:

- wyraźnie wolniejszy
- mniej wygodny w codziennym użyciu
- bardziej męczący przy dłuższych promptach

Czyli:

- `11B` ma sens do eksperymentów
- `4.5B` ma sens do codziennego pisania draftów

## Oficjalne źródła

SpeakLeash / Bielik:

- kolekcja: <https://huggingface.co/speakleash/collections>
- model: <https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct>
- GGUF: <https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct-GGUF>

## Jakie zastosowanie ma mieć Bielik

W tym projekcie najlepszy model pracy to:

- Bielik lokalnie pisze tekst
- główny model OpenClaw robi rzeczy agentowe i narzędziowe
- skrypty projektu robią build, obrazy i deploy

Nie polecam używać Bielika lokalnie jako głównego modelu do:

- tool use
- manipulacji plikami
- debugowania workflow
- automatycznego publishu

Najlepiej używać go tylko do:

- draftów postów
- opisów postów
- CTA
- wariantów tytułów
- meta descriptions
- treści marketingowych po polsku

## Jaki plik GGUF wybrać

### Wybór podstawowy

Startowy plik:

- `Bielik-4.5B-v3.0-Instruct.Q8_0.gguf`

To dobry pierwszy wybór, bo:

- zachowuje sensowną jakość
- jest prosty do opisania i odtworzenia
- nie wymaga od razu eksperymentowania z wieloma kwantyzacjami

### Jeśli okaże się za wolny

Jeśli ten wariant będzie dla Ciebie za wolny lokalnie, wtedy drugi krok to:

- zejść na lżejszą kwantyzację tego samego modelu

Ale jako dokumentacja startowa i najbezpieczniejszy pierwszy setup polecam zacząć od oficjalnego, czytelnego punktu odniesienia.

## Jak uruchomić Bielika lokalnie

### 1. Upewnij się, że działa Ollama

Masz już lokalnie `ollama`, ale najpierw backend musi działać poprawnie.

Sprawdzenie:

```bash
curl http://127.0.0.1:11434/api/tags
```

Jeśli dostaniesz odpowiedź JSON, runtime działa.

Jeśli nie:

1. uruchom aplikację Ollama
2. albo uruchom:

```bash
ollama serve
```

### 2. Pobierz albo zaimportuj GGUF

Masz dwa podejścia.

#### Wariant A: własny GGUF + `Modelfile`

Pobierz plik GGUF z repo:

- <https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct-GGUF>

Załóżmy, że zapiszesz go tutaj:

- `/Users/simacbook/Models/Bielik-4.5B-v3.0-Instruct.Q8_0.gguf`

Potem utwórz `Modelfile`, na przykład:

```text
FROM /Users/simacbook/Models/Bielik-4.5B-v3.0-Instruct.Q8_0.gguf

PARAMETER num_ctx 8192
PARAMETER temperature 0.7
PARAMETER repeat_penalty 1.1

SYSTEM """
Jestes polskim copywriterem i redaktorem blogowym.
Piszesz czystym, naturalnym, poprawnym jezykiem polskim.
Nie wymyslasz faktow. Nie dodajesz anglicyzmow bez potrzeby.
Tworzysz praktyczne, konkretne drafty postow i tekstow marketingowych.
"""
```

Zapisz go np. jako:

- `/Users/simacbook/Models/Bielik-4.5B-Modelfile`

Następnie utwórz model w Ollamie:

```bash
ollama create bielik-content -f /Users/simacbook/Models/Bielik-4.5B-Modelfile
```

Uruchom test:

```bash
ollama run bielik-content
```

#### Wariant B: gotowy model przez Ollama, jeśli pojawi się w katalogu

Jeśli oficjalny katalog Ollamy ma gotowy wpis dla odpowiedniego Bielika, możesz użyć `ollama pull`.

Ale dla tego projektu i dla kontroli nad GGUF lepszy jest wariant A.

## Jak testować Bielika lokalnie

Najprostszy test:

```bash
ollama run bielik-content
```

Prompt testowy:

```text
Napisz draft posta blogowego po polsku na temat: Jak naprawić trzaskające drzwi.
Ton: praktyczny, prosty, konkretny.
Dlugosc: 700-900 slow.
Struktura:
- wstep
- co bedzie potrzebne
- krok po kroku
- najczestsze bledy
- kiedy wezwac fachowca
- podsumowanie
Nie dodawaj markdown frontmatter.
Nie udawaj eksperta od prac niebezpiecznych.
```

## Jak podpiąć Bielika do OpenClaw tylko do generowania treści

## Najważniejsza zasada

Nie ustawiaj Bielika jako globalnego domyślnego modelu głównej automatyzacji.

Zostaw główny model agentowy bez zmian.

Bielik ma być tylko:

- dodatkowym lokalnym modelem do draftów
- używanym ręcznie wtedy, gdy chcesz napisać tekst po polsku

## Zalecany model pracy

Najbezpieczniejszy workflow:

1. w OpenClaw używasz Bielika tylko do wygenerowania draftu
2. po review wracasz do głównego modelu
3. główny model zapisuje plik, uruchamia obraz, build i deploy

To rozdziela:

- generowanie tekstu
- operacje agentowe i narzędziowe

## Koncepcja konfiguracji OpenClaw

OpenClaw trzyma runtime providerów w:

- `/Users/simacbook/.openclaw/agents/main/agent/models.json`

A modele domyślne i aliasy w:

- `/Users/simacbook/.openclaw/openclaw.json`

### Provider lokalny Ollama

Przykładowy wpis runtime dla lokalnego provider’a:

```json
{
  "providers": {
    "openrouter": {
      "...": "bez zmian"
    },
    "ollama": {
      "baseUrl": "http://127.0.0.1:11434/v1",
      "api": "openai-completions",
      "models": [
        {
          "id": "bielik-content",
          "name": "Bielik Local Content",
          "reasoning": false,
          "input": ["text"],
          "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
          },
          "contextWindow": 8192,
          "maxTokens": 4096
        }
      ],
      "apiKey": "ollama"
    }
  }
}
```

### Alias modelu w OpenClaw

W:

- `/Users/simacbook/.openclaw/openclaw.json`

dodaj alias:

```json
"ollama/bielik-content": {
  "alias": "Bielik Local Content"
}
```

### Czego nie robić

Nie zmieniaj:

```json
"primary": "openrouter/meta-llama/llama-3.1-70b-instruct"
```

na Bielika, jeśli chcesz używać go tylko do draftów.

Zostaw `primary` jako model agentowy, a Bielika wybieraj ręcznie tylko w sesjach contentowych.

## Jak używać tego w OpenClaw UI

Docelowy flow:

1. uruchom OpenClaw UI
2. wybierz model `Bielik Local Content`
3. poproś tylko o draft tekstu
4. skopiuj albo zatwierdź draft
5. przełącz się z powrotem na model główny
6. poproś główny model o zapisanie draftu do repo i dalsze kroki

## Jaki prompt dawać Bielikowi w OpenClaw

Najlepiej krótki, konkretny, bez proszenia o tool use.

Przykład:

```text
Napisz draft posta blogowego po polsku na temat: Jak naprawić trzaskające drzwi.
Cel: praktyczny poradnik dla poczatkujacych.
Forma:
- tytul
- lead
- 5-7 sekcji z naglowkami H2
- podsumowanie
Ton: prosty, naturalny, wiarygodny.
Nie wykonuj narzedzi. Nie zapisuj plikow. Zwracaj tylko sam tekst draftu.
```

## Dlaczego ten prompt jest ważny

Lokalny model contentowy powinien:

- generować tylko tekst
- nie próbować robić operacji na plikach
- nie udawać agenta narzędziowego

To jest dokładnie ten przypadek, w którym Bielik ma sens.

## Rekomendowany workflow dla tego projektu

### Etap 1. Draft

Model:

- `Bielik Local Content`

Zadanie:

- napisanie draftu posta po polsku

### Etap 2. Operacje projektowe

Model:

- Twój główny model OpenClaw

Zadanie:

- zapisanie draftu do `blog/content/posts`
- uzupełnienie frontmatter
- wygenerowanie obrazu
- `npm run build`
- review
- ewentualny deploy

## Troubleshooting

### Problem: Ollama nie odpowiada

Sprawdź:

```bash
curl http://127.0.0.1:11434/api/tags
```

Jeśli brak odpowiedzi:

- uruchom aplikację Ollama
- albo:

```bash
ollama serve
```

### Problem: Bielik jest za wolny

Wtedy:

1. skróć `num_ctx`
2. skróć prompt
3. używaj go tylko do draftów 600-900 słów
4. rozważ lżejszy wariant modelu

### Problem: OpenClaw nadal używa modelu głównego

Sprawdź:

- czy dodałeś alias `ollama/bielik-content`
- czy provider `ollama` jest widoczny runtime
- czy po restarcie OpenClaw model pojawia się w UI

Jeśli nie:

- potraktuj podpięcie do OpenClaw jako etap drugi
- najpierw uruchom Bielika przez samo `ollama run`

## Najkrótsza wersja

Dla Ciebie:

1. wybierz `Bielik-4.5B-v3.0-Instruct.Q8_0.gguf`
2. uruchom go lokalnie przez `ollama create bielik-content`
3. używaj go tylko do draftów treści
4. nie ustawiaj go jako głównego modelu agentowego
5. po wygenerowaniu draftu wracaj do głównego modelu, który zrobi resztę workflow

## Wniosek

Na Twoim sprzęcie Bielik ma sens jako:

- lokalny polski writer
- generator draftów
- pomocnik do marketing copy

Nie jako:

- główny agent narzędziowy
- model do pełnej automatyzacji projektu

Taki podział ról będzie najbardziej stabilny i praktyczny.
